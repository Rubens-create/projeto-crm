package database

import (
	"errors"
	"testing"
	"time"

	"crm-terceirizados/internal/config"
	"crm-terceirizados/internal/model"
)

func newSQLiteTestDB(t *testing.T) *DB {
	t.Helper()
	t.Chdir(t.TempDir())
	db, err := New(config.Config{Database: config.DatabaseConfig{URL: "host=127.0.0.1 port=1 user=test dbname=test sslmode=disable connect_timeout=1"}})
	if err != nil {
		t.Fatalf("New() error = %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db
}

func TestCleanSchemaSeedsPropertiesAndServiceRelationships(t *testing.T) {
	db := newSQLiteTestDB(t)
	var propertyCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM properties").Scan(&propertyCount); err != nil {
		t.Fatalf("count properties error = %v", err)
	}
	if propertyCount != 4 {
		t.Fatalf("properties count = %d, want 4", propertyCount)
	}

	expected := map[string]string{"OPT-01": "IMO-01", "OPT-02": "IMO-02", "OPT-03": "IMO-03", "OPT-04": "IMO-04"}
	rows, err := db.Query("SELECT id, property_id FROM service_options ORDER BY id")
	if err != nil {
		t.Fatalf("query service property links error = %v", err)
	}
	defer rows.Close()
	linked := 0
	for rows.Next() {
		var serviceID, propertyID string
		if err := rows.Scan(&serviceID, &propertyID); err != nil {
			t.Fatalf("scan service property link error = %v", err)
		}
		if propertyID != expected[serviceID] {
			t.Fatalf("service %q property_id = %q, want %q", serviceID, propertyID, expected[serviceID])
		}
		linked++
	}
	if linked != 4 {
		t.Fatalf("linked services = %d, want 4", linked)
	}
}

func TestCleanSchemaRemovesRedundantPropertyColumns(t *testing.T) {
	db := newSQLiteTestDB(t)
	if _, err := db.Query("SELECT properties FROM clients"); err == nil {
		t.Fatal("clients.properties still exists")
	}
	if _, err := db.Query("SELECT name, bedrooms, image FROM service_options"); err == nil {
		t.Fatal("physical property columns still exist in service_options")
	}
	if _, err := db.Query("SELECT client_id FROM service_executions"); err == nil {
		t.Fatal("service_executions.client_id still exists")
	}
}

func TestSQLiteForeignKeysAreEnabled(t *testing.T) {
	db := newSQLiteTestDB(t)
	var enabled int
	if err := db.QueryRow("PRAGMA foreign_keys").Scan(&enabled); err != nil {
		t.Fatalf("PRAGMA foreign_keys error = %v", err)
	}
	if enabled != 1 {
		t.Fatalf("PRAGMA foreign_keys = %d, want 1", enabled)
	}
}

func TestCreateAndSearchPropertyWithClient(t *testing.T) {
	db := newSQLiteTestDB(t)
	property := model.Property{ID: "IMO-TEST-01", ClientID: "CLI-01", Name: "Apartamento Central", Address: "Rua Central, 100", Description: "Acesso pela portaria", Bedrooms: 2, Bathrooms: 1, LivingRooms: 1, Sqm: 72, Image: "data:image/png;base64,abc", EstimatedTime: "3h", Status: model.PropertyActive}
	if err := db.CreateProperty(property); err != nil {
		t.Fatalf("CreateProperty() error = %v", err)
	}
	properties, err := db.GetAllProperties("central")
	if err != nil {
		t.Fatalf("GetAllProperties() error = %v", err)
	}
	if len(properties) != 1 || properties[0].ClientName == "" || properties[0].Sqm != 72 {
		t.Fatalf("unexpected properties: %#v", properties)
	}
}

func TestUpdatePropertyChangesClientAndStructure(t *testing.T) {
	db := newSQLiteTestDB(t)
	property, err := db.GetProperty("IMO-01")
	if err != nil {
		t.Fatalf("GetProperty() error = %v", err)
	}
	property.ClientID = "CLI-02"
	property.Address = "Novo endereço"
	property.Bedrooms = 3
	if err := db.UpdateProperty(property); err != nil {
		t.Fatalf("UpdateProperty() error = %v", err)
	}
	updated, err := db.GetProperty("IMO-01")
	if err != nil || updated.ClientID != "CLI-02" || updated.Address != "Novo endereço" || updated.Bedrooms != 3 {
		t.Fatalf("unexpected updated property: %#v, err=%v", updated, err)
	}
}

func TestArchivePropertyPreservesRelatedServices(t *testing.T) {
	db := newSQLiteTestDB(t)
	if err := db.ArchiveProperty("IMO-01"); err != nil {
		t.Fatalf("ArchiveProperty() error = %v", err)
	}
	property, err := db.GetProperty("IMO-01")
	if err != nil || property.Status != model.PropertyArchived || len(property.Services) == 0 {
		t.Fatalf("archived property lost state or services: %#v, err=%v", property, err)
	}
}

func TestDeletePropertyBlocksRelatedRecordsAndDeletesUnlinkedProperty(t *testing.T) {
	db := newSQLiteTestDB(t)
	if err := db.DeleteProperty("IMO-01"); !errors.Is(err, ErrPropertyInUse) {
		t.Fatalf("DeleteProperty(linked) error = %v, want ErrPropertyInUse", err)
	}
	unlinked := model.Property{ID: "IMO-UNLINKED", Name: "Sem vínculo", Status: model.PropertyActive}
	if err := db.CreateProperty(unlinked); err != nil {
		t.Fatalf("CreateProperty() error = %v", err)
	}
	if err := db.DeleteProperty(unlinked.ID); err != nil {
		t.Fatalf("DeleteProperty(unlinked) error = %v", err)
	}
	if _, err := db.GetProperty(unlinked.ID); !errors.Is(err, ErrPropertyNotFound) {
		t.Fatalf("GetProperty(deleted) error = %v, want ErrPropertyNotFound", err)
	}
}

func TestClientPropertyCountComesFromRelationship(t *testing.T) {
	db := newSQLiteTestDB(t)
	property, err := db.GetProperty("IMO-03")
	if err != nil {
		t.Fatalf("GetProperty() error = %v", err)
	}
	property.ClientID = "CLI-01"
	if err := db.UpdateProperty(property); err != nil {
		t.Fatalf("UpdateProperty() error = %v", err)
	}
	clients, err := db.GetAllClients()
	if err != nil {
		t.Fatalf("GetAllClients() error = %v", err)
	}
	for _, client := range clients {
		if client.ID == "CLI-01" {
			if client.Properties != 3 || len(client.PropertyItems) != 3 {
				t.Fatalf("client relationship = %d/%d, want 3/3", client.Properties, len(client.PropertyItems))
			}
			return
		}
	}
	t.Fatal("CLI-01 not found")
}

func TestStartExecutionDerivesClientFromServiceProperty(t *testing.T) {
	db := newSQLiteTestDB(t)
	_, execution, err := db.StartExecution("PRO-01", "OPT-01", time.Now())
	if err != nil {
		t.Fatalf("StartExecution() error = %v", err)
	}
	if execution.ClientID != "CLI-01" {
		t.Fatalf("execution client_id = %q, want CLI-01", execution.ClientID)
	}
	stored, err := db.GetExecutionForProfessional(execution.ID, "PRO-01")
	if err != nil || stored.ClientID != "CLI-01" || stored.ClientName == "" {
		t.Fatalf("stored execution client = %q/%q, err=%v", stored.ClientID, stored.ClientName, err)
	}
}

func TestServiceOptionsReadPropertyDataThroughRelationship(t *testing.T) {
	db := newSQLiteTestDB(t)
	property, err := db.GetProperty("IMO-01")
	if err != nil {
		t.Fatalf("GetProperty() error = %v", err)
	}
	property.Name = "Nome atualizado no imóvel"
	property.Sqm = 99
	if err := db.UpdateProperty(property); err != nil {
		t.Fatalf("UpdateProperty() error = %v", err)
	}
	options, err := db.GetAllOptions()
	if err != nil {
		t.Fatalf("GetAllOptions() error = %v", err)
	}
	for _, option := range options {
		if option.ID == "OPT-01" {
			if option.PropertyID != "IMO-01" || option.Name != property.Name || option.Sqm != 99 {
				t.Fatalf("service did not read related property: %#v", option)
			}
			return
		}
	}
	t.Fatal("OPT-01 not found")
}

func TestCreateAndUpdateServicePropertyRelationship(t *testing.T) {
	db := newSQLiteTestDB(t)
	first := model.Property{ID: "IMO-FIRST", Name: "Primeiro imóvel", Status: model.PropertyActive}
	second := model.Property{ID: "IMO-SECOND", Name: "Segundo imóvel", Status: model.PropertyActive}
	if err := db.CreateProperty(first); err != nil {
		t.Fatalf("CreateProperty(first) error = %v", err)
	}
	if err := db.CreateProperty(second); err != nil {
		t.Fatalf("CreateProperty(second) error = %v", err)
	}
	if err := db.CreateOption("OPT-NEW", first.ID, "Limpeza padrão", 150, "2h"); err != nil {
		t.Fatalf("CreateOption() error = %v", err)
	}
	if err := db.UpdateOption("OPT-NEW", second.ID, "Limpeza profunda", 175, "3h"); err != nil {
		t.Fatalf("UpdateOption() error = %v", err)
	}
	options, err := db.GetAllOptions()
	if err != nil {
		t.Fatalf("GetAllOptions() error = %v", err)
	}
	for _, option := range options {
		if option.ID == "OPT-NEW" {
			if option.PropertyID != second.ID || option.Name != second.Name || option.Description != "Limpeza profunda" || option.Rate != 175 {
				t.Fatalf("unexpected service option: %#v", option)
			}
			return
		}
	}
	t.Fatal("OPT-NEW not found")
}
