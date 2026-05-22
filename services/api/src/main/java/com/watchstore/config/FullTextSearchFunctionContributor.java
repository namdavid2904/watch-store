package com.watchstore.config;

import org.hibernate.boot.model.FunctionContributions;
import org.hibernate.boot.model.FunctionContributor;
import org.hibernate.type.StandardBasicTypes;

public class FullTextSearchFunctionContributor implements FunctionContributor {

    @Override
    public void contributeFunctions(FunctionContributions functionContributions) {
        var basicTypeRegistry = functionContributions.getTypeConfiguration().getBasicTypeRegistry();
        functionContributions.getFunctionRegistry().registerPattern(
                "fts",
                "(?1 @@ plainto_tsquery('english', ?2))",
                basicTypeRegistry.resolve(StandardBasicTypes.BOOLEAN)
        );
    }
}
