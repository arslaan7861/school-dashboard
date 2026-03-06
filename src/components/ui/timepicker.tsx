"use client";

import * as React from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className,
  disabled = false,
}: TimePickerProps) {
  const [hours, minutes] = value?.split(":").map(Number) || [0, 0];
  const [isOpen, setIsOpen] = React.useState(false);

  const formatHour = (hour: number): string => {
    return hour.toString().padStart(2, "0");
  };

  const formatMinute = (minute: number): string => {
    return minute.toString().padStart(2, "0");
  };

  const handleHourChange = (newHour: number) => {
    if (newHour >= 0 && newHour <= 23) {
      onChange(`${formatHour(newHour)}:${formatMinute(minutes)}`);
    }
  };

  const handleMinuteChange = (newMinute: number) => {
    if (newMinute >= 0 && newMinute <= 59) {
      onChange(`${formatHour(hours)}:${formatMinute(newMinute)}`);
    }
  };

  const incrementHour = () => handleHourChange(hours + 1);
  const decrementHour = () => handleHourChange(hours - 1);
  const incrementMinute = () => handleMinuteChange(minutes + 1);
  const decrementMinute = () => handleMinuteChange(minutes - 1);

  const presetTimes = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between text-left font-normal",
            "hover:bg-muted/50 transition-colors",
            !value && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {value ? (
              <span className="font-mono">{value}</span>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="text-sm font-medium text-center border-b pb-2">
            Select Time
          </div>

          {/* Time Picker Grid */}
          <div className="flex items-center justify-center gap-4">
            {/* Hours */}
            <div className="flex flex-col items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={incrementHour}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={formatHour(hours)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) handleHourChange(val);
                  }}
                  className="w-16 text-center font-mono text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-lg font-medium">
                  :
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={decrementHour}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground mt-1">Hour</span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={incrementMinute}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={0}
                max={59}
                value={formatMinute(minutes)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) handleMinuteChange(val);
                }}
                className="w-16 text-center font-mono text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                onClick={decrementMinute}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground mt-1">Minute</span>
            </div>
          </div>

          {/* Quick Preset Times */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground px-1">
              Quick Select
            </div>
            <div className="grid grid-cols-5 gap-1">
              {presetTimes.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "text-xs font-mono",
                    value === time &&
                      "bg-primary text-primary-foreground hover:bg-primary",
                  )}
                  onClick={() => {
                    onChange(time);
                    setIsOpen(false);
                  }}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Current Selection */}
          {value && (
            <div className="text-xs text-center text-muted-foreground border-t pt-2">
              Selected: <span className="font-mono font-medium">{value}</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
