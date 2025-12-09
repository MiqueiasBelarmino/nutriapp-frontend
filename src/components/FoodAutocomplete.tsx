import { useState, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { useFoods } from "@/hooks/useFoods";

interface FoodOption {
    id: string;
    name: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
}

interface FoodAutocompleteProps {
    value: string | null;
    onChange: (foodId: string | null) => void;
}

export function FoodAutocomplete({ value, onChange }: FoodAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { results: foods, searchFoods, loading } = useFoods();

    useEffect(() => {
        if (!search.trim()) return;

        const timer = setTimeout(() => {
            searchFoods(search);  // agora está MEMORIZADA
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);


    const selectedFood = foods.find((f: FoodOption) => f.id === value) as FoodOption | undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                >
                    {selectedFood ? (
                        <span>{selectedFood.name}</span>
                    ) : (
                        <span className="text-muted-foreground">
                            Selecione um alimento…
                        </span>
                    )}
                    <ChevronsUpDown className="w-4 h-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                    <CommandInput
                        placeholder="Buscar alimento..."
                        onValueChange={(val) => setSearch(val)}
                    />


                    <CommandList>
                        {loading && (
                            <div className="p-2 text-sm text-muted-foreground">
                                Buscando…
                            </div>
                        )}

                        {!loading && foods.length === 0 && (
                            <CommandEmpty>Nenhum alimento encontrado.</CommandEmpty>
                        )}

                        {foods.map((food: FoodOption) => (
                            <CommandItem
                                key={food.id}
                                value={food.name}
                                onSelect={() => {
                                    onChange(food.id);
                                    setOpen(false);
                                }}
                            >
                                <div>
                                    <p className="font-medium">{food.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {food.calories} kcal / 100g
                                    </p>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
