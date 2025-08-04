<script lang="ts">
  import Big from "big.js";
  import type { FormData } from "../form-data";
  import { makeCurrencyFormatter } from "$lib/currency";
  import { dateFormatter } from "$lib/dates";
  import { getLocalTimeZone } from "@internationalized/date";

  const props: FormData = $props();

  const currencyFormatter = makeCurrencyFormatter(props.currency);

  const total = $derived(
    props.items.reduce((acc, item) => {
      const itemTotal = new Big(item.hours).times(item.rate);
      return new Big(acc).plus(itemTotal);
    }, new Big(0))
  );
</script>

<div
  class="!w-[210mm] !max-w-[210mm] min-h-[297mm] bg-white prose prose-neutral p-[10mm] print:p-0 space-y-16"
>
  <div class="flex justify-between items-start">
    <div class="flex-2">
      <div class="font-bold">{props.sender.name}</div>
      <div class="text-sm space-y-1">
        <div>{props.sender.taxId}</div>
        <div>{props.sender.address}</div>
        <div>{props.sender.email}</div>
      </div>
    </div>
    <div class="text-right flex-1">
      <h1 class="mb-0">Invoice</h1>
      <div>Invoice #{props.invoice.number}</div>
    </div>
  </div>

  <div>
    <div class="font-bold">Bill to</div>
    <div class="flex w-full flex-1 justify-between">
      <div class="text-sm space-y-1 flex-1">
        <div>{props.recipient.name}</div>
        <div>{props.recipient.address}</div>
      </div>
      <div class="text-right text-sm min-w-64 space-y-1">
        <div class="flex justify-between">
          <div class="flex-1">Invoice&nbsp;Date:</div>
          <div class="flex-1">{dateFormatter.format(props.invoice.date.toDate(getLocalTimeZone()))}</div>
        </div>
        <div class="flex justify-between">
          <div class="flex-1">Due&nbsp;Date:</div>
          <div class="flex-1">{dateFormatter.format(props.invoice.dueDate.toDate(getLocalTimeZone()))}</div>
        </div>
        <div class="flex justify-between gap-2">
          <div class="flex-1">Terms:</div>
          <div class="flex-1">{props.invoice.terms}</div>
        </div>
      </div>
    </div>
  </div>

  <div>
    <table class="mb-0">
      <thead>
        <tr>
          <th>#</th>
          <th>Item & Description</th>
          <th class="text-right">Quantity</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {#each props.items as item, index}
          <tr>
            <td>{index + 1}</td>
            <td>{item.description}</td>
            <td class="text-right">{item.hours}&nbsp;h</td>
            <td class="text-right">{currencyFormatter.format(item.rate)}</td>
            <td class="text-right">
              {currencyFormatter.format(
                new Big(item.hours).times(item.rate).toNumber()
              )}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="flex justify-end text-sm">
      <div class="text-right min-w-64 space-y-1">
        <div class="flex justify-between">
          <div class="flex-1">Sub Total:</div>
          <div class="flex-1">
            {currencyFormatter.format(total.toNumber())}
          </div>
        </div>
        <div class="flex justify-between font-bold">
          <div class="flex-1">Total:</div>
          <div class="flex-1">
            {currencyFormatter.format(total.toNumber())}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div>
    <div class="font-bold">Terms and Conditions</div>
    <div class="text-sm whitespace-pre-wrap">{props.termsAndConditions}</div>
  </div>
</div>
