# Manual Database Setup

If the automated setup script fails due to connection issues, you can run the SQL manually.

## Option 1: Using MySQL Client

Connect to your database using any MySQL client (MySQL Workbench, phpMyAdmin, command line, etc.) and run the SQL in `schema.sql`.

## Option 2: Using Command Line

```bash
mysql -h srv1943.hstgr.io -u ecommerce01 -p ecommerce01 < database/schema.sql
```

When prompted, enter password: `Monstermash@123`

## Option 3: Copy and Paste SQL

1. Open `server/database/schema.sql`
2. Copy all the SQL statements
3. Paste into your MySQL client/phpMyAdmin
4. Execute the statements

## Troubleshooting Connection Issues

If you're getting "Access denied" errors:

1. **Check IP Whitelist**: Your database host might only allow connections from specific IP addresses. Contact your hosting provider to whitelist your current IP (`102.209.111.190`).

2. **Verify Credentials**: Double-check the username and password are correct.

3. **Check SSL Requirements**: Some MySQL hosts require SSL connections. You may need to enable SSL in the connection settings.

4. **Firewall**: Ensure your firewall allows outbound connections to port 3306 (MySQL default port).

## Test Connection

You can test if the connection works by trying to connect manually:

```bash
mysql -h srv1943.hstgr.io -u ecommerce01 -p ecommerce01
```

Enter password when prompted. If this works, the automated script should work too after fixing any IP whitelist issues.

