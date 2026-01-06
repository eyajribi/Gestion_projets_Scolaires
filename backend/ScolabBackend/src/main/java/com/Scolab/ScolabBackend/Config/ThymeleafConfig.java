package com.Scolab.ScolabBackend.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.nio.charset.StandardCharsets;

@Configuration
public class ThymeleafConfig {

    @Bean
    public SpringTemplateEngine templateEngine() {
        SpringTemplateEngine templateEngine = new SpringTemplateEngine();
        templateEngine.addTemplateResolver(emailTemplateResolver());
        return templateEngine;
    }

    public ClassLoaderTemplateResolver emailTemplateResolver() {
        ClassLoaderTemplateResolver emailTemplateResolver = new ClassLoaderTemplateResolver();
        emailTemplateResolver.setPrefix("templates/");
        emailTemplateResolver.setSuffix(".html");
        emailTemplateResolver.setTemplateMode(TemplateMode.HTML);
        emailTemplateResolver.setCharacterEncoding(StandardCharsets.UTF_8.name());
        emailTemplateResolver.setCacheable(false);
        return emailTemplateResolver;
    }
}
