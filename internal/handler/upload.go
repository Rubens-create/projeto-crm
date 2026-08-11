package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func (h *Handler) Upload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		h.jsonError(w, "method not allowed", 405)
		return
	}
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		h.jsonError(w, "file too large", 400)
		return
	}
	file, handler, err := r.FormFile("file")
	if err != nil {
		h.jsonError(w, "file error", 400)
		return
	}
	defer file.Close()

	uploadDir := filepath.Join("web", "uploads")
	_ = os.MkdirAll(uploadDir, 0755)

	ext := filepath.Ext(handler.Filename)
	if ext == "" {
		ext = ".png"
	}
	filename := fmt.Sprintf("img_%d%s", time.Now().UnixNano(), ext)
	dstPath := filepath.Join(uploadDir, filename)

	dst, err := os.Create(dstPath)
	if err != nil {
		h.jsonError(w, "create file error", 500)
		return
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		h.jsonError(w, "write file error", 500)
		return
	}

	h.jsonResponse(w, map[string]string{"url": "/uploads/" + filename})
}
