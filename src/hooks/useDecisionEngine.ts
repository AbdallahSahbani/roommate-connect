/**
 * React hook for the Decision Engine
 * 
 * Provides easy access to authorization checks in components.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  evaluateAction,
  getReasonMessage,
  getNextStepRoute,
  ActionType,
  EvaluationResult,
} from "@/lib/decisionEngine";

interface UseDecisionEngineReturn {
  evaluate: (
    actionType: ActionType,
    targetId?: string,
    options?: { groupId?: string; propertyId?: string }
  ) => Promise<EvaluationResult | null>;
  isEvaluating: boolean;
  lastResult: EvaluationResult | null;
}

export function useDecisionEngine(userId: string | null): UseDecisionEngineReturn {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastResult, setLastResult] = useState<EvaluationResult | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const evaluate = useCallback(
    async (
      actionType: ActionType,
      targetId?: string,
      options?: { groupId?: string; propertyId?: string }
    ): Promise<EvaluationResult | null> => {
      if (!userId) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        navigate("/auth");
        return null;
      }

      setIsEvaluating(true);

      try {
        const result = await evaluateAction({
          action_type: actionType,
          user_id: userId,
          target_id: targetId,
          group_id: options?.groupId,
          property_id: options?.propertyId,
        });

        setLastResult(result);

        if (!result.allowed) {
          const message = getReasonMessage(result.reason_code);
          
          toast({
            title: "Action Not Allowed",
            description: message,
            variant: "destructive",
          });

          // Auto-navigate to first next step if available
          if (result.next_steps.length > 0) {
            const route = getNextStepRoute(result.next_steps[0]);
            if (route) {
              setTimeout(() => navigate(route), 1500);
            }
          }
        }

        return result;
      } catch (error) {
        console.error("[useDecisionEngine] Error:", error);
        toast({
          title: "Error",
          description: "Unable to verify action. Please try again.",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsEvaluating(false);
      }
    },
    [userId, navigate, toast]
  );

  return {
    evaluate,
    isEvaluating,
    lastResult,
  };
}
