CREATE TABLE orders_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TIMESTAMP NOT NULL,
    customer VARCHAR(255) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    items VARCHAR(2000) NOT NULL,
    owner_id INTEGER NOT NULL,
    status VARCHAR(255) NOT NULL,
    complement VARCHAR(255),
    CONSTRAINT fk_orders_owner FOREIGN KEY (owner_id) REFERENCES users (id)
);

-- Keep every order, including an unmatched owner, so the NOT NULL constraint
-- aborts the migration instead of silently discarding rows.
INSERT INTO orders_new (id, created_at, customer, delivery_address, items, owner_id, status, complement)
SELECT orders.id, orders.created_at, orders.customer, orders.delivery_address, orders.items,
       users.id, orders.status, orders.complement
FROM orders
LEFT JOIN users ON lower(trim(users.email)) = lower(trim(orders.owner_email));

DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;

CREATE INDEX idx_orders_owner_created_id
    ON orders (owner_id, created_at DESC, id DESC);
