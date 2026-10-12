package auth

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Recovery codes are the only way back into an account when the authenticator
// device is gone, so their shape and hashing must be exact.

func TestGenerateRecoveryCode_Shape(t *testing.T) {
	for i := 0; i < 200; i++ {
		code := generateRecoveryCode()
		require.Len(t, code, 10, "recovery code must be exactly 10 chars")
		assert.Equal(t, strings.ToUpper(code), code, "recovery code must be uppercase hex")
		assert.NotRegexp(t, `[^0-9A-F]`, code, "recovery code must contain only hex digits")
	}
}

func TestGenerateRecoveryCodes_CountAndUniqueness(t *testing.T) {
	codes := generateRecoveryCodes(recoveryCodeCount)
	require.Len(t, codes, recoveryCodeCount)

	seen := make(map[string]struct{}, len(codes))
	for _, c := range codes {
		require.Len(t, c, 10)
		_, dup := seen[c]
		assert.False(t, dup, "recovery codes must be unique within a batch: %s", c)
		seen[c] = struct{}{}
	}
}

func TestGenerateRecoveryCodes_ZeroAndNegativeCount(t *testing.T) {
	assert.Empty(t, generateRecoveryCodes(0))
	assert.Empty(t, generateRecoveryCodes(-1))
}

// A recovery code is only ever persisted as a SHA-256 hash, so the stored value
// must never leak the plaintext the user copies down.
func TestGenerateRecoveryCodes_HashesDoNotLeakPlaintext(t *testing.T) {
	codes := generateRecoveryCodes(recoveryCodeCount)
	hashes := make([]string, 0, len(codes))
	for _, c := range codes {
		h := sha256Hex(c)
		require.Len(t, h, 64)
		hashes = append(hashes, h)
	}
	for i, c := range codes {
		for _, h := range hashes {
			assert.NotContains(t, h, c, "hash must not embed the plaintext code")
		}
		assert.Equal(t, sha256Hex(c), hashes[i], "hashing must be deterministic")
	}
}

// The length gate that routes a login code to the TOTP verifier vs. the
// recovery-code lookup is what keeps a 6-digit TOTP code from ever being
// accepted as a recovery code (and vice versa).
func TestRecoveryCodeLengthDoesNotOverlapTOTP(t *testing.T) {
	assert.Equal(t, 10, len(generateRecoveryCode()))
	assert.NotEqual(t, 6, len(generateRecoveryCode()),
		"recovery codes must not be 6 chars long, or they would collide with TOTP codes")
}
