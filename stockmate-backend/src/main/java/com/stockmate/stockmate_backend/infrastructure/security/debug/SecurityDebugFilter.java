package com.stockmate.stockmate_backend.infrastructure.security.debug;

import jakarta.servlet.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(1)
public class SecurityDebugFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(SecurityDebugFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
/*
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String method = req.getMethod();
        String uri = req.getRequestURI();
        String origin = req.getHeader("Origin");
        String authorization = req.getHeader("Authorization");

        String headers = Collections.list(req.getHeaderNames()).stream()
                .map(h -> h + ": " + req.getHeader(h))
                .collect(Collectors.joining("\n    "));

        log.warn("=== [SecurityDebug] INCOMING REQUEST ===");
        log.warn("  {} {}", method, uri);
        log.warn("  Origin:        {}", origin);
        log.warn("  Authorization: {}", authorization != null
                ? authorization.substring(0, Math.min(20, authorization.length())) + "..."
                : "none");
        log.warn("  All headers:\n    {}", headers);



        log.warn("=== [SecurityDebug] RESPONSE ===");
        log.warn("  {} {} -> HTTP {}", method, uri, res.getStatus());
        log.warn("  Access-Control-Allow-Origin:   {}", nvl(res.getHeader("Access-Control-Allow-Origin")));
        log.warn("  Access-Control-Allow-Methods:  {}", nvl(res.getHeader("Access-Control-Allow-Methods")));
        log.warn("  Access-Control-Allow-Headers:  {}", nvl(res.getHeader("Access-Control-Allow-Headers")));
        log.warn("  Access-Control-Allow-Credentials: {}", nvl(res.getHeader("Access-Control-Allow-Credentials")));*/
        chain.doFilter(request, response);
    }

    private String nvl(String value) {
        return value != null ? value : "(absent)";
    }
}
