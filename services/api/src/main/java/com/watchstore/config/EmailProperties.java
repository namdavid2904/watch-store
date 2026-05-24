package com.watchstore.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mail")
public class EmailProperties {

    private boolean enabled;
    private String fromAddress;
    private String adminAlertAddress;
    private String region;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getFromAddress() {
        return fromAddress;
    }

    public void setFromAddress(String fromAddress) {
        this.fromAddress = fromAddress;
    }

    public String getAdminAlertAddress() {
        return adminAlertAddress;
    }

    public void setAdminAlertAddress(String adminAlertAddress) {
        this.adminAlertAddress = adminAlertAddress;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }
}
