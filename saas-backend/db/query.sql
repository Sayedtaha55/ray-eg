-- name: CreateStore :one
INSERT INTO stores (name, slug, domain, subdomain, logo_url, status, settings)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetStoreByID :one
SELECT * FROM stores WHERE id = $1 LIMIT 1;

-- name: GetStoreBySlug :one
SELECT * FROM stores WHERE slug = $1 LIMIT 1;

-- name: GetStoreByDomain :one
SELECT * FROM stores WHERE domain = $1 OR subdomain = $1 LIMIT 1;

-- name: UpdateStoreStatus :one
UPDATE stores
SET status = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: ListStores :many
SELECT * FROM stores
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: CreateUser :one
INSERT INTO users (store_id, email, password_hash, role, is_active)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE store_id = $1 AND email = $2 LIMIT 1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1 LIMIT 1;

-- name: CreateProduct :one
INSERT INTO products (store_id, name, description, price, stock, image_url, is_active, metadata)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetProductByID :one
SELECT * FROM products WHERE id = $1 AND store_id = $2 LIMIT 1;

-- name: ListProductsByStore :many
SELECT * FROM products
WHERE store_id = $1 AND is_active = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: UpdateProduct :one
UPDATE products
SET name = $2, description = $3, price = $4, stock = $5, image_url = $6, is_active = $7, metadata = $8, updated_at = NOW()
WHERE id = $1 AND store_id = $9
RETURNING *;

-- name: DeleteProduct :exec
DELETE FROM products WHERE id = $1 AND store_id = $2;

-- ============ Categories ============

-- name: CreateCategory :one
INSERT INTO categories (store_id, parent_id, name, slug, description, image_url, sort_order, is_active)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetCategoryByID :one
SELECT * FROM categories WHERE id = $1 AND store_id = $2 LIMIT 1;

-- name: ListCategoriesByStore :many
SELECT * FROM categories
WHERE store_id = $1 AND is_active = $2
ORDER BY sort_order ASC, name ASC
LIMIT $3 OFFSET $4;

-- name: ListCategoriesByParent :many
SELECT * FROM categories
WHERE store_id = $1 AND parent_id IS NOT DISTINCT FROM $2 AND is_active = true
ORDER BY sort_order ASC, name ASC;

-- name: UpdateCategory :one
UPDATE categories
SET name = $2, slug = $3, description = $4, image_url = $5, sort_order = $6, is_active = $7, updated_at = NOW()
WHERE id = $1 AND store_id = $8
RETURNING *;

-- name: DeleteCategory :exec
DELETE FROM categories WHERE id = $1 AND store_id = $2;

-- ============ Product-Category linking ============

-- name: AddProductToCategory :exec
INSERT INTO product_categories (product_id, category_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- name: RemoveProductFromCategory :exec
DELETE FROM product_categories WHERE product_id = $1 AND category_id = $2;

-- name: GetProductCategories :many
SELECT c.* FROM categories c
JOIN product_categories pc ON pc.category_id = c.id
WHERE pc.product_id = $1 AND c.store_id = $2;

-- ============ Orders ============

-- name: CreateOrder :one
INSERT INTO orders (
    store_id, user_id, order_number, status,
    subtotal, tax, shipping, discount, total, currency,
    customer_name, customer_email, customer_phone,
    shipping_address, billing_address, notes, metadata
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
RETURNING *;

-- name: GetOrderByID :one
SELECT * FROM orders WHERE id = $1 AND store_id = $2 LIMIT 1;

-- name: GetOrderByNumber :one
SELECT * FROM orders WHERE order_number = $1 AND store_id = $2 LIMIT 1;

-- name: ListOrdersByStore :many
SELECT * FROM orders
WHERE store_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListOrdersByStatus :many
SELECT * FROM orders
WHERE store_id = $1 AND status = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: UpdateOrderStatus :one
UPDATE orders
SET status = $2, updated_at = NOW()
WHERE id = $1 AND store_id = $3
RETURNING *;

-- name: CountOrdersByStore :one
SELECT COUNT(*) FROM orders WHERE store_id = $1;

-- ============ Order Items ============

-- name: CreateOrderItem :one
INSERT INTO order_items (order_id, product_id, name, description, price, quantity, subtotal, metadata)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetOrderItems :many
SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC;

-- ============ Media ============

-- name: CreateMedia :one
INSERT INTO media (
    store_id, uploaded_by, purpose, original_key, original_url, mime_type,
    file_size, width, height, linked_type, linked_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;

-- name: GetMediaByID :one
SELECT * FROM media WHERE id = $1 AND store_id = $2 LIMIT 1;

-- name: GetMediaByKey :one
SELECT * FROM media WHERE original_key = $1 LIMIT 1;

-- name: ListMediaByStore :many
SELECT * FROM media
WHERE store_id = $1 AND is_active = true AND ($2::text = '' OR purpose = $2)
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: UpdateMediaOptimization :one
UPDATE media
SET
    optimization_status = $2,
    thumb_key = $3, thumb_url = $4,
    small_key = $5, small_url = $6,
    medium_key = $7, medium_url = $8,
    optimized_key = $9, optimized_url = $10,
    optimization_error = $11,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteMedia :exec
UPDATE media SET is_active = false, updated_at = NOW()
WHERE id = $1 AND store_id = $2;
