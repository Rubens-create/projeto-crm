package model

import "testing"

func TestCalculateExecutionValueCentsRoundsToNearestCent(t *testing.T) {
	value, err := CalculateExecutionValueCents(3000, 9000)
	if err != nil {
		t.Fatalf("CalculateExecutionValueCents() error = %v", err)
	}
	if value != 7500 {
		t.Fatalf("CalculateExecutionValueCents() = %d, want 7500", value)
	}
}

func TestCalculateExecutionValueCentsRejectsInvalidValues(t *testing.T) {
	for _, testCase := range []struct {
		rateCents int64
		seconds   int64
	}{
		{0, 3600},
		{3000, -1},
	} {
		if _, err := CalculateExecutionValueCents(testCase.rateCents, testCase.seconds); err == nil {
			t.Fatalf("CalculateExecutionValueCents(%d, %d) error = nil", testCase.rateCents, testCase.seconds)
		}
	}
}
