const assert = require("node:assert/strict");
const { jazzcashSecureHash, jazzcashHashValid } = require("./jazzcashHash");
const { amountsEqual, assertMatch } = require("./shared");
const mock = require("./providers/mock");
const bank = require("./providers/bank");
const easypaisa = require("./providers/easypaisa");

async function run() {
  const official = jazzcashSecureHash(
    {
      pp_MerchantID: "MER123",
      pp_OrderInfo: "A48cvE28",
      pp_Amount: "2995",
    },
    "0F5DD14AE2",
  );
  assert.equal(
    official,
    "c7689cda7474eb1adcd343fd0c0b676bad0ba66361cc46db589bdb0da4c1c867",
  );
  assert.equal(
    jazzcashHashValid(
      {
        pp_MerchantID: "MER123",
        pp_OrderInfo: "A48cvE28",
        pp_Amount: "2995",
        pp_SecureHash: official,
      },
      "0F5DD14AE2",
    ),
    true,
  );
  assert.equal(
    jazzcashHashValid(
      {
        pp_MerchantID: "MER123",
        pp_OrderInfo: "A48cvE28",
        pp_Amount: "1",
        pp_SecureHash: official,
      },
      "0F5DD14AE2",
    ),
    false,
  );

  assert.equal(amountsEqual(499, "499.00"), true);
  assert.equal(amountsEqual(499, 498), false);

  const order = {
    id: "11111111-1111-4111-8111-111111111111",
    amount: 499,
    currency: "PKR",
    provider_reference: "T123",
  };
  assert.throws(
    () => assertMatch(order, { providerReference: "NOPE", amount: 499, currency: "PKR" }),
    /Transaction reference/,
  );
  assert.throws(
    () => assertMatch(order, { providerReference: "T123", amount: 1, currency: "PKR" }),
    /amount/,
  );
  assert.throws(
    () => assertMatch(order, { providerReference: "T123", amount: 499, currency: "USD" }),
    /currency/,
  );

  process.env.BILLING_MOCK_ENABLED = "true";
  process.env.PAYMENT_ENV = "sandbox";
  const success = await mock.verifyPayment(order, { outcome: "successful" });
  assert.equal(success.status, "successful");
  const failed = await mock.verifyPayment(order, { outcome: "failed" });
  assert.equal(failed.status, "failed");
  const cancelled = await mock.verifyPayment(order, { outcome: "cancelled" });
  assert.equal(cancelled.status, "cancelled");

  await assert.rejects(
    () =>
      bank.verifyPayment(
        { ...order, provider_reference: "bank_1", provider_transaction_id: "user-ref" },
        { outcome: "successful" },
      ),
    /cannot upgrade Pro/,
  );
  const stillPending = await bank.verifyPayment(
    { ...order, provider_reference: "bank_1" },
    { reference: "user-ref" },
  );
  assert.equal(stillPending.status, "pending");

  const adminOk = await bank.verifyPayment(
    { ...order, provider_reference: "bank_1" },
    { outcome: "successful", source: "admin" },
  );
  assert.equal(adminOk.status, "successful");

  await assert.rejects(
    () =>
      easypaisa.verifyPayment(order, {
        status: "Success",
        desc: "0000",
        orderRefNum: "T123",
      }),
    /not proof of payment/,
  );

  console.log("billing guards passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
