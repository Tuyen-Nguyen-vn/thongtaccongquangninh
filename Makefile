SHELL := /usr/bin/env bash

.PHONY: setup doctor check help

setup:
	./scripts/install.sh --yes

doctor:
	./scripts/doctor.sh

check: doctor

help:
	@echo "Targets:"
	@echo "  make setup   - Cài tool + chuẩn hóa terminal"
	@echo "  make doctor  - Kiểm tra môi trường"
	@echo "  make check   - Chạy doctor"
