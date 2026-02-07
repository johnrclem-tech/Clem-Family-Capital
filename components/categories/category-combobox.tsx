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

interface Category {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
}

interface CategoryComboboxProps {
  categories: Category[];
  value?: string | null;
  onChange: (value: string | null) => void;
  onManageCategories?: () => void;
  onManageMappings?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CategoryCombobox({
  categories,
  value,
  onChange,
  onManageCategories,
  onManageMappings,
  placeholder = "Select category...",
  className,
  disabled = false,
}: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCategory = categories.find((cat) => cat.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              {selectedCategory.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedCategory.color }}
                />
              )}
              {selectedCategory.icon && (
                <span>{selectedCategory.icon}</span>
              )}
              <span>{selectedCategory.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
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
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onChange(category.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    {category.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    {category.icon && (
                      <span>{category.icon}</span>
                    )}
                    <span>{category.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {(onManageCategories || onManageMappings) && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  {onManageCategories && (
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        onManageCategories();
                      }}
                      className="text-primary"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Categories
                    </CommandItem>
                  )}
                  {onManageMappings && (
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        onManageMappings();
                      }}
                      className="text-primary"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Mappings
                    </CommandItem>
                  )}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
