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
  parent_id: string | null;
  is_parent_category: boolean;
}

interface ParentCategoryComboboxProps {
  categories: Category[];
  value: string | null;
  currentCategoryId: string;
  onChange: (value: string | null) => void;
  onManageParentCategories: () => void;
  className?: string;
}

export function ParentCategoryCombobox({
  categories,
  value,
  currentCategoryId,
  onChange,
  onManageParentCategories,
  className,
}: ParentCategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // Filter to only parent categories (using is_parent_category flag) and exclude current category
  const parentCategories = React.useMemo(() => {
    return categories
      .filter((cat) => cat.is_parent_category === true && cat.id !== currentCategoryId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, currentCategoryId]);

  const selectedCategory = parentCategories.find((cat) => cat.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn("h-8 w-full justify-start text-sm font-normal px-2", className)}
        >
          {selectedCategory ? (
            <span className="text-sm">{selectedCategory.name}</span>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
          <ChevronsUpDown className="ml-auto h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search parent categories..." className="h-9" />
          <CommandList>
            <CommandEmpty>No parent category found.</CommandEmpty>
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
                <span className="text-sm">None</span>
              </CommandItem>
              {parentCategories.map((category) => (
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
                  <span className="text-sm">{category.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  onManageParentCategories();
                }}
                className="text-primary"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span className="text-sm">Manage Parent Categories</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
