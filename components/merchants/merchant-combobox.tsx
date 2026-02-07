"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MerchantComboboxProps {
  merchantNames: string[];
  value?: string | null;
  onChange: (value: string | null) => void;
  onManageMerchants?: () => void;
  placeholder?: string;
  className?: string;
}

export function MerchantCombobox({
  merchantNames,
  value,
  onChange,
  onManageMerchants,
  placeholder = "Select merchant...",
  className,
}: MerchantComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedMerchant = value || null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedMerchant ? (
            <span>{selectedMerchant}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search merchants..." />
          <CommandList>
            <CommandEmpty>No merchant found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value=""
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="text-muted-foreground italic">None</span>
              </CommandItem>
              {merchantNames.map((merchantName) => (
                <CommandItem
                  key={merchantName}
                  value={merchantName}
                  onSelect={() => {
                    onChange(merchantName);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === merchantName ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{merchantName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {onManageMerchants && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      onManageMerchants();
                    }}
                    className="text-primary"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Merchants
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
