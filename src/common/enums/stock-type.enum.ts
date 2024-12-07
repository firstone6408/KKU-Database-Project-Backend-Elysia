import { t } from "elysia";

export enum StockTypeEnum
{
    ADD = "ADD", // การเพิ่มจำนวนสินค้า (เช่น เพิ่มจำนวนสินค้าที่มีอยู่แล้ว)
    REMOVE = "REMOVE", // การลดจำนวนสินค้า (เช่น ขายออก)
    TRANSFER = "TRANSFER", // การโยกย้ายสินค้าไปยังคลังอื่น
    ADJUST = "ADJUST", // การปรับปรุงจำนวนสินค้า
}

export const StockTypeT = t.Enum({
    ADD: "ADD", // การเพิ่มจำนวนสินค้า (เช่น เพิ่มจำนวนสินค้าที่มีอยู่แล้ว)
    REMOVE: "REMOVE", // การลดจำนวนสินค้า (เช่น ขายออก)
    TRANSFER: "TRANSFER", // การโยกย้ายสินค้าไปยังคลังอื่น
    ADJUST: "ADJUST", // การปรับปรุงจำนวนสินค้า
})