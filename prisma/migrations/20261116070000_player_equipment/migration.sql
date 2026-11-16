CREATE TABLE "PlayerEquippedItem" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "type" "InventoryItemType" NOT NULL,
  "equippedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlayerEquippedItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlayerEquippedItem_userId_type_key" ON "PlayerEquippedItem"("userId", "type");
CREATE UNIQUE INDEX "PlayerEquippedItem_userId_itemId_key" ON "PlayerEquippedItem"("userId", "itemId");
CREATE INDEX "PlayerEquippedItem_userId_equippedAt_idx" ON "PlayerEquippedItem"("userId", "equippedAt" DESC);

ALTER TABLE "PlayerEquippedItem"
  ADD CONSTRAINT "PlayerEquippedItem_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerEquippedItem"
  ADD CONSTRAINT "PlayerEquippedItem_itemId_fkey"
  FOREIGN KEY ("itemId") REFERENCES "StoreItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
