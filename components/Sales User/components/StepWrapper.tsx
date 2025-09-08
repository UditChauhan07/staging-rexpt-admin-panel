import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StepWrapperProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

const StepWrapper: React.FC<StepWrapperProps> = ({ step, totalSteps, title, description, children }) => {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Step {step} of {totalSteps}</h2>
          <span className="text-sm text-gray-500">{progress.toFixed(0)}% Complete</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <div className="p-6">{children}</div>
      </Card>
    </div>
  );
};

export default StepWrapper;