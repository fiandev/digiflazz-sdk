import crypto from "crypto"
import axios from "axios"

type PriceListType = "prepaid" | "pasca"

type TransactoinType = null | "inq-pasca" | "pay-pasca" | "status-pasca"

export interface DigiflazzConfigProps {
  username: string
  key: string
  webhook?: string
}

export interface DigiflazzReturnProps<T> {
  cekSaldo: () => Promise<T>
  daftarHarga: (cmdOption: PriceListType) => Promise<T>
  deposit: (props: DigiflazzDepositProps) => Promise<T>
  transaksi: (props: DigiflazzTransactionProps) => Promise<T>
  cekIdPln: (customerNo: string) => Promise<T>
}

interface DigiflazzDepositProps {
  amount: number
  bank: string
  name: string
}

interface DigiflazzTransactionProps {
  sku: string
  customerNo: string
  refId: string
  cmd?: TransactoinType
  testing: boolean
  msg: string
}

export default function createDigiflazzConfig({
  username,
  key,
}: DigiflazzConfigProps): DigiflazzReturnProps<unknown> {
  const endpoint = "https://api.digiflazz.com/v1"

  const cekSaldo = async () => {
    const payload = {
      cmd: "deposit",
      username,
      sign: crypto
        .createHash("md5")
        .update(`${username}${key}depo`)
        .digest("hex"),
    }

    try {
      const { data } = await axios.post(`${endpoint}/cek-saldo`, payload)
      return data
    } catch (error) {
      throw new Error("An error occurred while making the request.")
    }
  }

  const daftarHarga = async (cmdOption: PriceListType) => {
    const payload = {
      cmd: cmdOption,
      username,
      sign: crypto
        .createHash("md5")
        .update(`${username}${key}pricelist`)
        .digest("hex"),
    }

    try {
      const { data } = await axios.post(`${endpoint}/price-list`, payload)
      return data
    } catch (error) {
      throw new Error("An error occurred while making the request.")
    }
  }

  const deposit = async ({ amount, bank, name }: DigiflazzDepositProps) => {
    const payload = {
      username,
      amount,
      Bank: bank,
      owner_name: name,
      sign: crypto
        .createHash("md5")
        .update(`${username}${key}deposit`)
        .digest("hex"),
    }

    try {
      const { data } = await axios.post(`${endpoint}/deposit`, payload)
      return data
    } catch (error) {
      throw new Error("An error occurred while making the request.")
    }
  }

  const transaksi = async ({
    sku,
    customerNo,
    refId,
    cmd = null,
    testing,
    msg,
  }: DigiflazzTransactionProps) => {
    const payload = {
      username,
      buyer_sku_code: sku,
      customer_no: customerNo,
      ref_id: refId,
      testing,
      msg,
      ...(cmd && { commands: cmd }),
      sign: crypto
        .createHash("md5")
        .update(`${username}${key}${refId}`)
        .digest("hex"),
    }

    /** NOTE:
    inq-pasca: cek tagihan
    pay-pasca: bayar tagihan
    status-pasca: cek status tagihan
  
    ** Jangan pernah mencoba untuk melakukan Cek Status terhadap transaksi yang sudah lewat 90 HARI karena hal tersebut akan menyebabkan pembuatan transaksi BARU. **
    **/

    if (cmd === "inq-pasca") payload.commands = "inq-pasca"
    if (cmd === "pay-pasca") payload.commands = "pay-pasca"
    if (cmd === "status-pasca") payload.commands = "status-pasca"

    try {
      const { data } = await axios.post(`${endpoint}/transaction`, payload)
      return data
    } catch (error) {
      throw new Error("An error occurred while making the request.")
    }
  }

  const cekIdPln = async (customerNo: string) => {
    const payload = {
      customer_no: customerNo,
      commands: "pln-subscribe",
    }

    const body = JSON.stringify({ ...payload, username, sign: "" })

    try {
      const { data } = await axios.post(`${endpoint}/transaction`, body)
      return data
    } catch (error) {
      throw new Error("An error occurred while making the request.")
    }
  }

  return {
    cekSaldo,
    daftarHarga,
    deposit,
    transaksi,
    cekIdPln,
  }
}
