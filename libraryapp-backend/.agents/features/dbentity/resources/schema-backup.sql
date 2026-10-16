-- schema-backup.sql
-- PostgreSQL DDL for libraryapp-backend (dbentity)

DROP TABLE IF EXISTS detalle_reserva CASCADE;
DROP TABLE IF EXISTS reserva CASCADE;
DROP TABLE IF EXISTS libro CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;

CREATE TABLE categoria (
  id_categoria SERIAL PRIMARY KEY,
  nombre VARCHAR(70) NOT NULL,
  descripcion VARCHAR(200) NOT NULL,
  estado VARCHAR(20) NOT NULL
);

CREATE TABLE cliente (
  id_cliente SERIAL PRIMARY KEY,
  nombres VARCHAR(80) NOT NULL,
  apellidos VARCHAR(120) NOT NULL,
  cedula VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL
);

CREATE TABLE libro (
  id_libro SERIAL PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  autor VARCHAR(150) NOT NULL,
  isbn VARCHAR(50) NOT NULL,
  disponible BOOLEAN NOT NULL,
  id_categoria INTEGER NOT NULL,
  CONSTRAINT fk_libro_categoria FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria)
);

CREATE TABLE reserva (
  id_reserva SERIAL PRIMARY KEY,
  fecha_reserva TIMESTAMP NOT NULL,
  id_cliente INTEGER NOT NULL,
  CONSTRAINT fk_reserva_cliente FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente)
);

CREATE TABLE detalle_reserva (
  id_detalle_reserva SERIAL PRIMARY KEY,
  id_reserva INTEGER NOT NULL,
  id_libro INTEGER NOT NULL,
  CONSTRAINT fk_detail_reserva FOREIGN KEY (id_reserva) REFERENCES reserva (id_reserva),
  CONSTRAINT fk_detail_reserva_libro FOREIGN KEY (id_libro) REFERENCES libro (id_libro)
);
