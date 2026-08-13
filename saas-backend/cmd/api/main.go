package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/auth"
	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/database"
	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/db"
	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/handlers"
	"github.com/Sayedtaha55/ray-eg/saas-backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if present (development convenience).
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found, using system env vars: %v", err)
	}
	// Load configuration from env.
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dev-secret-change-me-in-production-32chars"
	}

	accessExpiry := 15 * time.Minute
	refreshExpiry := 7 * 24 * time.Hour

	// Connect to PostgreSQL.
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := database.New(ctx)
	if err != nil {
		log.Printf("⚠️  Database not available: %v", err)
		log.Println("Starting server without database (degraded mode)...")
	} else {
		defer pool.Close()
		log.Println("✅ Connected to PostgreSQL")
	}

	// Initialize sqlc queries.
	var queries *db.Queries
	if pool != nil {
		queries = db.New(pool)
	}

	// Initialize token service.
	tokenService := auth.NewTokenService(jwtSecret, accessExpiry, refreshExpiry)

	// Create Fiber app.
	app := fiber.New(fiber.Config{
		AppName:      "saas-backend",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  30 * time.Second,
	})

	// Security middlewares: CORS, Helmet, Rate Limiting.
	middleware.Security(app)

	// Tenant isolation middleware (resolves store from host or header).
	if queries != nil {
		app.Use(middleware.Tenant(queries))
	}

	// API v1 routes.
	api := app.Group("/api/v1")

	// Store routes (public — no auth required for create and lookup).
	if queries != nil {
		storeHandler := handlers.NewStoreHandler(queries)
		api.Post("/stores", storeHandler.Create)
		api.Get("/stores/:id", storeHandler.GetByID)
		api.Get("/stores/domain/:domain", storeHandler.GetByDomain)
		api.Get("/stores", storeHandler.List)

		// Auth routes (tenant-scoped — require tenant context).
		authHandler := handlers.NewAuthHandler(queries, tokenService)
		api.Post("/auth/register", authHandler.Register)
		api.Post("/auth/login", authHandler.Login)
		api.Post("/auth/refresh", authHandler.Refresh)
		api.Post("/auth/logout", authHandler.Logout)

		// Protected auth routes (JWT required).
		authed := api.Group("/auth", auth.JWTAuth(tokenService))
		authed.Get("/me", authHandler.Me)

		// Product routes (tenant-scoped).
		// Public product listing requires tenant context but no auth.
		productHandler := handlers.NewProductHandler(queries)
		api.Get("/products", productHandler.List)
		api.Get("/products/:id", productHandler.GetByID)

		// Protected product routes (JWT required).
		authedProducts := api.Group("/products", auth.JWTAuth(tokenService))
		authedProducts.Post("/", productHandler.Create)
		authedProducts.Patch("/:id", productHandler.Update)
		authedProducts.Delete("/:id", productHandler.Delete)

		// Category routes (tenant-scoped).
		categoryHandler := handlers.NewCategoryHandler(queries)
		api.Get("/categories", categoryHandler.List)
		api.Get("/categories/:id", categoryHandler.GetByID)
		api.Get("/categories/:parentId/children", categoryHandler.ListChildren)

		// Protected category routes (JWT required).
		authedCategories := api.Group("/categories", auth.JWTAuth(tokenService))
		authedCategories.Post("/", categoryHandler.Create)
		authedCategories.Patch("/:id", categoryHandler.Update)
		authedCategories.Delete("/:id", categoryHandler.Delete)

		// Product-category assignment (JWT required).
		authedProducts.Post("/:id/categories/:categoryId", categoryHandler.AssignProduct)
		authedProducts.Delete("/:id/categories/:categoryId", categoryHandler.UnassignProduct)

		// Order routes (tenant-scoped).
		// Public order creation (checkout) requires tenant context but no auth (guest checkout).
		orderHandler := handlers.NewOrderHandler(queries)
		api.Post("/orders", orderHandler.Create)
		api.Get("/orders", orderHandler.List)
		api.Get("/orders/:id", orderHandler.GetByID)

		// Protected order routes (JWT required for status updates).
		authedOrders := api.Group("/orders", auth.JWTAuth(tokenService))
		authedOrders.Patch("/:id/status", orderHandler.UpdateStatus)
	}

	// Health check.
	app.Get("/health", func(c *fiber.Ctx) error {
		status := fiber.Map{"status": "ok", "service": "saas-backend"}
		if pool != nil {
			if err := pool.Ping(c.UserContext()); err != nil {
				status["status"] = "degraded"
				status["database"] = "unreachable"
			} else {
				status["database"] = "connected"
			}
		} else {
			status["database"] = "not_configured"
		}
		return c.JSON(status)
	})

	// Protected routes example (JWT auth required).
	protected := api.Group("/protected", auth.JWTAuth(tokenService))
	protected.Get("/me", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"user_id":  c.Locals("user_id"),
			"store_id": c.Locals("store_id"),
			"role":     c.Locals("role"),
		})
	})

	// Start server.
	go func() {
		log.Printf("🚀 Server starting on :%s", port)
		if err := app.Listen(":" + port); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Graceful shutdown.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := app.ShutdownWithContext(shutdownCtx); err != nil {
		log.Printf("Error during shutdown: %v", err)
	}

	log.Println("Server stopped")
}
