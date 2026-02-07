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

interface Tag {
  id: string;
  name: string;
  color?: string | null;
}

interface TagComboboxProps {
  tags: Tag[];
  value?: string | null;
  onChange: (value: string | null) => void;
  onManageTags?: () => void;
  placeholder?: string;
  className?: string;
}

export function TagCombobox({
  tags,
  value,
  onChange,
  onManageTags,
  placeholder = "Select tag...",
  className,
}: TagComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedTag = tags.find((tag) => tag.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedTag ? (
            <div className="flex items-center gap-2">
              {selectedTag.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedTag.color }}
                />
              )}
              <span>{selectedTag.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search tags..." />
          <CommandList>
            <CommandEmpty>No tag found.</CommandEmpty>
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
              {tags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  value={tag.name}
                  onSelect={() => {
                    onChange(tag.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === tag.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    {tag.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                    )}
                    <span>{tag.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {onManageTags && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      onManageTags();
                    }}
                    className="text-primary"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Tags
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
