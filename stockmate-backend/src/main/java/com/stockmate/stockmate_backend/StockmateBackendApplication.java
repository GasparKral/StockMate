package com.stockmate.stockmate_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class StockmateBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(StockmateBackendApplication.class, args);
    }

}
