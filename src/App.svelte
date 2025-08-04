<script lang="ts">
  import "./app.css";
  import type { FormData } from "./lib/form-data";
  import Form from "./lib/components/Form.svelte";
  import Sheet from "./lib/components/Sheet.svelte";
  import { Toaster } from "./lib/components/ui/sonner";
  import { toast } from "svelte-sonner";
  import { today, getLocalTimeZone } from "@internationalized/date";
  import { loadFormData, saveFormData } from "./lib/storage";
  import { onMount } from "svelte";

  const defaultFormData: FormData = {
    sender: {
      name: "",
      taxId: "",
      address: "",
      email: "",
    },
    invoice: {
      number: 1,
      date: today(getLocalTimeZone()),
      terms: "",
      dueDate: today(getLocalTimeZone()),
    },
    recipient: {
      name: "",
      address: "",
    },
    items: [
      {
        description: "",
        hours: 0,
        rate: 0,
      },
    ],
    currency: "USD",
    termsAndConditions: "",
  };

  let formData: FormData = $state(defaultFormData);

  // Auto-save functionality
  let autoSaveInterval: ReturnType<typeof setInterval>;

  onMount(() => {
    // Load auto-saved data on app startup
    try {
      const savedData = loadFormData();
      if (savedData) {
        formData = savedData;
        toast.success("Loaded autosaved data", {
          closeButton: true,
        });
      }
    } catch (error) {
      console.error("Failed to load autosaved data:", error);
    }

    autoSaveInterval = setInterval(() => {
      try {
        saveFormData(formData);
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 1000);

    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  });
</script>

<main class="print:hidden w-screen h-screen flex justify-center gap-2 min-w-[1420px]">
  <Toaster position="top-center" />

  <div class="max-h-full overflow-y-auto px-4 py-4">
    <div class="rounded-xl overflow-clip shadow-md">
      <Sheet {...formData} />
    </div>
  </div>
  <div class="w-xl overflow-y-auto py-4">
    <Form bind:formData />
  </div>
</main>

<div class="print:block hidden">
  <Sheet {...formData} />
</div>
