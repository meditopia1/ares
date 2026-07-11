# Netcash Collection Documentation

This folder is the single source of truth for Day1Main Netcash collection, debit order, transaction, refund, and webhook documentation.

## Current Project Direction

Netcash is the active payment integration path for this project.

Use this folder when working on:

- debit order batch generation
- Netcash collection files
- Netcash account references
- broker group collection reporting
- failed payment handling
- transaction status tracking
- refunds
- webhook/payment-status processing
- Operations and Finance reconciliation flows

## Documents

- [MONEY_COLLECTION_METHODS.md](./MONEY_COLLECTION_METHODS.md) - collection methods and operational overview
- [DEBIT_ORDER_SYSTEM_COMPLETE.md](./DEBIT_ORDER_SYSTEM_COMPLETE.md) - debit order system implementation summary
- [DEBIT_ORDER_DASHBOARD_COMPLETE.md](./DEBIT_ORDER_DASHBOARD_COMPLETE.md) - Operations dashboard and Netcash UI flow
- [DEBIT_ORDER_TEST_DATA_READY.md](./DEBIT_ORDER_TEST_DATA_READY.md) - test data and Netcash references
- [TRANSACTION_TRACKING_COMPLETE.md](./TRANSACTION_TRACKING_COMPLETE.md) - transaction tracking design
- [WEBHOOK_TESTING_GUIDE.md](./WEBHOOK_TESTING_GUIDE.md) - Netcash webhook testing and handling
- [REFUND_SYSTEM_COMPLETE.md](./REFUND_SYSTEM_COMPLETE.md) - refund workflow and Netcash refund integration notes
- [DAY1HEALTH_DATABASE_SCHEMA.md](./DAY1HEALTH_DATABASE_SCHEMA.md) - payment/debit-order schema notes

## Build Rule

Do not add Qsure or unrelated payment-provider planning into this folder. If a future payment provider is considered, it must go into its own clearly named folder so Netcash remains clean.
