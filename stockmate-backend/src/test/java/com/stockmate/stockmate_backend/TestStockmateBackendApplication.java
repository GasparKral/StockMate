package com.stockmate.stockmate_backend;

import org.springframework.boot.SpringApplication;

public class TestStockmateBackendApplication {

	public static void main(String[] args) {
		SpringApplication.from(StockmateBackendApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
