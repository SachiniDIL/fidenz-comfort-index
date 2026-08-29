package com.fidenz.comfort_index;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = "openweathermap.api.key=test28hx84b87bx87h8")
class ComfortIndexApplicationTests {

	@Test
	void contextLoads() {
	}

}
