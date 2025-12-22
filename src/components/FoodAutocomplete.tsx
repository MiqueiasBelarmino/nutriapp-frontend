import { useState, useEffect, useRef } from "react";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useFoods } from "@/hooks/useFoods";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodOption {
    id: string;
    name: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
}

interface FoodAutocompleteProps {
    value: string; // The food name to display
    selectedId?: string; // The selected food ID (optional)
    onChange: (name: string, foodId?: string) => void;
    onSelect?: (food: FoodOption) => void;
    placeholder?: string;
    className?: string;

    // Backward compatibility props (optional, to be removed if strictly breaking)
    // We are changing the interface, so we expect breaking changes to be fixed in parent.
}

export function FoodAutocomplete({
    value,
    selectedId,
    onChange,
    onSelect,
    placeholder = "Digite o alimento...",
    className
}: FoodAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const { results: foods, searchFoods, loading } = useFoods();
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial load handling could be added if needed, but we rely on typing.

    useEffect(() => {
        // Debounce search when user types
        const timer = setTimeout(() => {
            if (value && value.trim().length > 1) { // Only search if length > 1
                searchFoods(value);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value, searchFoods]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        // When user types, we update the name but clear the ID because it's a new "free text" value potentially
        // unless it exactly matches (which is hard to know without selection).
        // Standard pattern: clear ID on type.
        onChange(newValue, undefined);
        setOpen(true);
    };

    const handleSelect = (food: FoodOption) => {
        onChange(food.name, food.id);
        if (onSelect) {
            onSelect(food);
        }
        setOpen(false);
    };

    return (
        <div className={cn("relative w-full", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative">
                        <Input
                            ref={inputRef}
                            value={value}
                            onChange={handleInputChange}
                            onFocus={() => {
                                if (value && value.length > 1) setOpen(true);
                            }}
                            placeholder={placeholder}
                            className="w-full"
                            autoComplete="off"
                        />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <Command shouldFilter={false}> 
                         {/* We disable internal filtering because backend does it */}
                        <CommandList>
                            {loading && (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                    Buscando...
                                </div>
                            )}
                            {!loading && foods.length === 0 && (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                    Nenhum alimento encontrado.
                                </div>
                            )}
                            <CommandGroup>
                                {foods.map((food: FoodOption) => (
                                    <CommandItem
                                        key={food.id}
                                        value={food.id} // value for CommandItem must be unique-ish or relevant
                                        onSelect={() => handleSelect(food)}
                                    >
                                        <div className="flex flex-col w-full">
                                            <div className="flex justify-between items-center w-full">
                                                <span className="font-medium">{food.name}</span>
                                                {selectedId === food.id && <Check className="h-4 w-4 opacity-50" />}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {food.calories} kcal / {food.servingSize}{food.servingUnit}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
