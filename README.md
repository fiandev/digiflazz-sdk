# Digiflazz Client Library

## Installation

```sh
pnpm add digiflazz-sdk
# or
npm install digiflazz-sdk
# or
yarn add digiflazz-sdk
```

## API

### Create Digiflazz Config
```js
import createDigiflazzConfig from "digiflazz-sdk"

const digiflazz = createDigiflazzConfig({
    username: [your digiflazz username],
    key: [your digiflazz api key]
})
```

#### Cek Saldo
```js
const amount = await digiflazz.cekSaldo(
    'prepaid | pasca'
);
```

#### Daftar Harga
```js
const priceList = await digiflazz.daftarHarga();
```

#### Tiket Deposit
```js
const deposit = await digiflazz.deposit({
    amount: 'nominal',
    bank: 'bank',
    name: 'bank account own name'
});
```

#### Transaksi Top Up
```js
const topup = await digiflazz.transaksi({
    sku: 'sku',
    customerNo: 'customer order number',
    refId: 'reference id',
    cmd: 'null | topup | pay-pasca | inq-pasca | status-pasca | pln-subscribe'
});
```

NOTE:
* inq-pasca: cek tagihan
* pay-pasca: bayar tagihan
* status-pasca: cek status tagihan
* pln-subscribe: cek id pln
* if the transaction isn't in seller mode dont use cmd.

### Webhook (Coming Soon)

### Seller Area (Coming Soon)
