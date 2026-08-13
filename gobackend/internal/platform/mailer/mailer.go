package mailer

import (
	"context"
	"fmt"
)

// Message represents an email to send.
type Message struct {
	To      string
	Subject string
	Text    string
	HTML    string
}

// Result reports whether the message was queued/sent.
type Result struct {
	OK bool
}

// Mailer abstracts email delivery.
type Mailer interface {
	Send(ctx context.Context, msg Message) (Result, error)
}

// NoOpMailer drops all emails. It is useful in development or when SMTP is not configured.
type NoOpMailer struct{}

func (NoOpMailer) Send(_ context.Context, _ Message) (Result, error) {
	fmt.Printf("[noop mailer] email not sent (SMTP not configured)\n")
	return Result{OK: false}, nil
}
