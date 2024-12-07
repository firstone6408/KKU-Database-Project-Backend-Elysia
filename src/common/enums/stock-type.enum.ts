import { t } from "elysia";

export enum StockTypeEnum
{
    ADD = "ADD", // การเพิ่มจำนวนสินค้า (เช่น เพิ่มจำนวนสินค้าที่มีอยู่แล้ว)
    REMOVE = "REMOVE", // การลดจำนวนสินค้า (เช่น ขายออก)
    TRANSFER = "TRANSFER", // การโยกย้ายสินค้าไปยังคลังอื่น
    ADJUST = "ADJUST", // การปรับปรุงจำนวนสินค้า
    CANCELED = "CANCELED" // ยกเลิก
}

export const StockTypeT = t.Enum({
    ADD: "ADD", // การเพิ่มจำนวนสินค้า (เช่น เพิ่มจำนวนสินค้าที่มีอยู่แล้ว)
    REMOVE: "REMOVE", // การลดจำนวนสินค้า (เช่น ขายออก)
    TRANSFER: "TRANSFER", // การโยกย้ายสินค้าไปยังคลังอื่น
    ADJUST: "ADJUST", // การปรับปรุงจำนวนสินค้า
    CANCELED: "CANCELED" // ยกเลิก
})

// Enum สำหรับสถานะของผู้ใช้
export enum StatusEnum
{
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}

// Enum สำหรับสถานะการชำระเงิน
export enum PaymentStatusEnum
{
    PENDING = "PENDING", // รอการชำระเงิน
    PAID = "PAID", // ชำระเงินเรียบร้อยแล้ว
    FAILED = "FAILED" // การชำระเงินล้มเหลว
}

// Enum สำหรับสถานะของการสั่งซื้อ
export enum OrderStatusEnum
{
    PENDING = "PENDING", // รอการดำเนินการ
    PROCESSING = "PROCESSING", // กำลังดำเนินการ (อาจจะเป็นการจัดส่งหรือเตรียมสินค้า)
    COMPLETED = "COMPLETED", // เสร็จสิ้น
    CANCELED = "CANCELED" // ยกเลิก
}

// Enum สำหรับวิธีการชำระเงิน
export enum PaymentMethodEnum
{
    CASH = "CASH", // ชำระด้วยเงินสด
    CREDIT_CARD = "CREDIT_CARD", // ชำระด้วยบัตรเครดิต
    DEBIT_CARD = "DEBIT_CARD", // ชำระด้วยบัตรเดบิต
    BANK_TRANSFER = "BANK_TRANSFER", // โอนเงินผ่านธนาคาร
    E_WALLET = "E_WALLET", // ชำระผ่านกระเป๋าเงินอิเล็กทรอนิกส์ (เช่น PayPal, AirPay, TrueMoney, Alipay)
    OTHER = "OTHER" // วิธีการชำระเงินอื่นๆ
}

export const PaymentMethodT = t.Enum(
    {
        CASH: "CASH", // ชำระด้วยเงินสด
        CREDIT_CARD: "CREDIT_CARD", // ชำระด้วยบัตรเครดิต
        DEBIT_CARD: "DEBIT_CARD", // ชำระด้วยบัตรเดบิต
        BANK_TRANSFER: "BANK_TRANSFER", // โอนเงินผ่านธนาคาร
        E_WALLET: "E_WALLET", // ชำระผ่านกระเป๋าเงินอิเล็กทรอนิกส์ (เช่น PayPal, AirPay, TrueMoney, Alipay)
        OTHER: "OTHER", // วิธีการชำระเงินอื่นๆ
        CANCELED: "CANCELED"
    }
)