-- V6__add_currently_building_to_projects.sql
ALTER TABLE projects ADD COLUMN currently_building BOOLEAN NOT NULL DEFAULT false;