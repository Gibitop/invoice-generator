<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import FileDown from "@lucide/svelte/icons/file-down";
  import Printer from "@lucide/svelte/icons/printer";
  import FileUp from "@lucide/svelte/icons/file-up";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronUp from "@lucide/svelte/icons/chevron-up";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import type { FormData } from "../form-data";
  import { Button } from "./ui/button";
  import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
  import { Input } from "./ui/input";
  import { Label } from "./ui/label";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "./ui/select";
  import { Textarea } from "./ui/textarea";
  import { cn } from "$lib/utils";
  import {
    TooltipProvider,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "./ui/tooltip";
  import Big from "big.js";
  import { currencies } from "$lib/currency";
  import * as Popover from "./ui/popover";
  import { Calendar } from "./ui/calendar";
  import { dateFormatter } from "$lib/dates";
  import { getLocalTimeZone } from "@internationalized/date";
  import {
    saveFormData,
    loadFormData,
    exportFormDataAsFile,
    importFormDataFromFile,
  } from "../storage";
  import { toast } from "svelte-sonner";

  type Props = {
    formData: FormData;
  };

  let { formData = $bindable() }: Props = $props();

  function addItem() {
    formData.items = [
      ...formData.items,
      { description: "", hours: 0, rate: 0 },
    ];
  }

  function removeItem(index: number) {
    if (formData.items.length > 1) {
      formData.items = formData.items.filter(
        (_: unknown, i: number) => i !== index
      );
    }
  }

  function moveItem(index: number, direction: "up" | "down") {
    const items = [...formData.items];
    const item = items[index];
    items[index] = items[index + (direction === "up" ? -1 : 1)];
    items[index + (direction === "up" ? -1 : 1)] = item;
    formData.items = items;
  }

  async function handleImport() {
    try {
      const result = await importFormDataFromFile();
      if (result.success) {
        formData = result.data;
        // Save the imported data as well
        saveFormData(formData);
        toast.success("Invoice imported successfully!", {
          closeButton: true,
        });
      } else {
        console.error("Import validation failed:", result.errors);
        toast.error("Import failed: Invalid file format", {
          closeButton: true,
        });
      }
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Failed to import invoice", {
        closeButton: true,
      });
    }
  }

  function handleExport() {
    try {
      exportFormDataAsFile(formData);
      // Also save to localStorage when exporting
      saveFormData(formData);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export invoice.");
    }
  }

  function handleSave() {
    try {
      saveFormData(formData);
      alert("Invoice saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save invoice.");
    }
  }

  function handleLoad() {
    try {
      const savedData = loadFormData();
      if (savedData) {
        formData = savedData;
        alert("Invoice loaded successfully!");
      } else {
        alert("No saved invoice found.");
      }
    } catch (error) {
      console.error("Load failed:", error);
      alert("Failed to load invoice.");
    }
  }
</script>

<div class="px-6">
  <div
    class="flex justify-between items-center mb-6 sticky top-0 bg-white/80 px-6 py-4 shadow-sm rounded-xl backdrop-blur-xs"
  >
    <h1 class="text-3xl font-bold">Invoice Generator</h1>
    <div class="flex gap-2 justify-end">
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onclick={handleImport}
            >
              <FileUp />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Import invoice from file</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onclick={handleExport}
            >
              <FileDown />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export invoice to file</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button type="button" onclick={() => window.print()}>
        <Printer />
        Print
      </Button>
    </div>
  </div>

  <form class="space-y-6">
    <!-- Invoice Details -->
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-4 space-y-2">
            <Label for="invoice-number">Invoice Number</Label>
            <Input
              id="invoice-number"
              type="number"
              bind:value={formData.invoice.number}
              min="1"
              required
            />
          </div>
          <div class="col-span-4 space-y-2">
            <Label for="invoice-date">Invoice Date</Label>

            <Popover.Root>
              <Popover.Trigger>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="outline"
                    class={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.invoice.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon class="mr-2 size-4" />
                    {formData.invoice.date
                      ? dateFormatter.format(
                          formData.invoice.date.toDate(getLocalTimeZone())
                        )
                      : "Select a date"}
                  </Button>
                {/snippet}
              </Popover.Trigger>
              <Popover.Content class="w-auto p-0">
                <Calendar
                  bind:value={formData.invoice.date}
                  type="single"
                  initialFocus
                />
              </Popover.Content>
            </Popover.Root>
          </div>

          <div class="col-span-4 space-y-2">
            <Label for="due-date">Due Date</Label>
            <Popover.Root>
              <Popover.Trigger>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="outline"
                    class={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.invoice.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon class="mr-2 size-4" />
                    {formData.invoice.dueDate
                      ? dateFormatter.format(
                          formData.invoice.dueDate.toDate(getLocalTimeZone())
                        )
                      : "Select a date"}
                  </Button>
                {/snippet}
              </Popover.Trigger>
              <Popover.Content class="w-auto p-0">
                <Calendar
                  bind:value={formData.invoice.dueDate}
                  type="single"
                  initialFocus
                />
              </Popover.Content>
            </Popover.Root>
          </div>
        </div>
        <div class="grid grid-cols-12 gap-4">
          <div class="space-y-2 col-span-8">
            <Label for="payment-terms">Payment Terms</Label>
            <Input
              id="payment-terms"
              type="text"
              placeholder="Due On Receipt"
              bind:value={formData.invoice.terms}
              required
            />
          </div>
          <div class="space-y-2 col-span-4">
            <Label for="currency">Currency</Label>
            <Select bind:value={formData.currency} type="single">
              <SelectTrigger class="w-full">
                <span>{formData.currency}</span>
              </SelectTrigger>
              <SelectContent>
                {#each Object.entries(currencies) as [key, value]}
                  <SelectItem value={key}>{value}</SelectItem>
                {/each}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Sender Information -->
    <Card>
      <CardHeader>
        <CardTitle>Sender Information</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="sender-name">Business Name</Label>
          <Input
            id="sender-name"
            bind:value={formData.sender.name}
            placeholder="Your Business Name"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="sender-tax-id">Tax ID / EIN</Label>
          <Input id="sender-tax-id" bind:value={formData.sender.taxId} />
        </div>
        <div class="space-y-2">
          <Label for="sender-address">Address</Label>
          <Textarea
            id="sender-address"
            bind:value={formData.sender.address}
            placeholder="Street Address, City, Country"
            rows={3}
          />
        </div>
        <div class="space-y-2">
          <Label for="sender-email">Email</Label>
          <Input
            id="sender-email"
            type="email"
            bind:value={formData.sender.email}
            placeholder="business@example.com"
            required
          />
        </div>
      </CardContent>
    </Card>

    <!-- Recipient Information -->
    <Card>
      <CardHeader>
        <CardTitle>Bill To</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="recipient-name">Client Name</Label>
          <Input
            id="recipient-name"
            bind:value={formData.recipient.name}
            placeholder="Client Business Name"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="recipient-address">Client Address</Label>
          <Textarea
            id="recipient-address"
            bind:value={formData.recipient.address}
            placeholder="Client Address, City, State, ZIP"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>

    <!-- Items Section -->
    <Card>
      <CardHeader class="flex flex-row items-start justify-between">
        <CardTitle>Items / Services</CardTitle>
        <Button type="button" size="sm" variant="outline" onclick={addItem}>
          <Plus class="w-4 h-4" />
          Add Item
        </Button>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-4">
          {#each formData.items as item, index}
            <div class="col-span-7 space-y-2">
              <Label for="item-desc-{index}">Description</Label>
              <Input
                id="item-desc-{index}"
                bind:value={item.description}
                placeholder="Service or item description"
                required
              />
            </div>
            <div
              class={cn(
                "grid grid-cols-12 gap-4 items-end border-b pb-4",
                index === formData.items.length - 1 && "border-b-0 pb-0"
              )}
            >
              <div class="col-span-3 space-y-2">
                <Label for="item-hours-{index}">Hours</Label>
                <Input
                  id="item-hours-{index}"
                  type="number"
                  bind:value={item.hours}
                  min="0"
                  placeholder="0"
                />
              </div>
              <div class="col-span-3 space-y-2">
                <Label for="item-rate-{index}">Rate ({formData.currency})</Label
                >
                <Input
                  id="item-rate-{index}"
                  type="number"
                  bind:value={item.rate}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div class="col-span-3 space-y-2">
                <Label for="item-rate-{index}"
                  >Amount ({formData.currency})</Label
                >
                <Input
                  id="item-rate-{index}"
                  type="number"
                  value={Big(item.hours).times(item.rate).toNumber()}
                  disabled
                />
              </div>
              <div class="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onclick={() => moveItem(index, "up")}
                  disabled={index === 0}
                >
                  <ChevronUp class="w-4 h-4" />
                </Button>
              </div>
              <div class="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onclick={() => moveItem(index, "down")}
                  disabled={index === formData.items.length - 1}
                >
                  <ChevronDown class="w-4 h-4" />
                </Button>
              </div>
              <div class="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onclick={() => removeItem(index)}
                  class="text-destructive hover:text-destructive"
                  disabled={formData.items.length === 1}
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>

    <!-- Terms and Conditions -->
    <Card>
      <CardHeader>
        <CardTitle>Terms and Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <Label for="terms">Additional Terms</Label>
          <Textarea
            id="terms"
            bind:value={formData.termsAndConditions}
            placeholder="Payment terms, late fees, return policy, etc."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  </form>
</div>
