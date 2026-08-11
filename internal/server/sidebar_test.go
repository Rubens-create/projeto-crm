package server_test

import (
	"bytes"
	"os"
	"path/filepath"
	"runtime"
	"testing"
)

func TestAllAdminSidebarsContainPropertiesNavigation(t *testing.T) {
	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	webDir := filepath.Join(filepath.Dir(currentFile), "..", "..", "web")
	pages := []string{
		"admin-services.html",
		"admin-professionals.html",
		"admin-clients.html",
		"admin-payments.html",
		"admin-reports.html",
		"admin-config.html",
	}
	needle := []byte(`href="/admin/imoveis"`)
	for _, page := range pages {
		content, err := os.ReadFile(filepath.Join(webDir, page))
		if err != nil {
			t.Fatalf("read %s: %v", page, err)
		}
		if count := bytes.Count(content, needle); count != 1 {
			t.Errorf("%s properties navigation count = %d, want 1", page, count)
		}
	}
}
