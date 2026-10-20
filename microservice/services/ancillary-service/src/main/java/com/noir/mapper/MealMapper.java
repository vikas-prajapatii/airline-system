package com.noir.mapper;

import com.noir.model.Meal;
import com.noir.payload.response.MealResponse;

public class MealMapper {

    public static MealResponse toResponse(Meal meal) {
        if (meal == null) return null;

        return MealResponse.builder()
                .id(meal.getId())
                .code(meal.getCode())
                .name(meal.getName())
                .description(meal.getDescription())
                .mealType(meal.getMealType())
                .dietaryRestriction(meal.getDietaryRestriction())
                .ingredients(meal.getIngredients())
                .imageUrl(meal.getImageUrl())
                .available(meal.getAvailable())
                .requiresAdvanceBooking(meal.getRequiresAdvanceBooking())
                .advanceBookingHours(meal.getAdvanceBookingHours())
                .displayOrder(meal.getDisplayOrder())
                .airlineId(meal.getAirlineId())
                .createdAt(meal.getCreatedAt())
                .updatedAt(meal.getUpdatedAt())
                .build();
    }
}
