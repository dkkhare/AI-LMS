# AI-LMS

AI-LMS is a Laravel 12, MySQL, React and TypeScript foundation for a scalable multi-tenant learning management system. The repository currently contains the API backend, the administrative web frontend, architecture documentation, infrastructure placeholders and the mobile application placeholder.

## Repository structure

```text
AI-LMS/
├── backend/         Laravel 12 REST API
├── web/             React 19 + TypeScript administrative frontend
├── mobile/          React Native student application placeholder
├── infrastructure/ AWS infrastructure placeholder
└── docs/            Architecture and database documentation
```

## Production installation on AWS EC2

This procedure installs the current backend and frontend on one Ubuntu 24.04 LTS EC2 instance using Apache, PHP 8.3 and a local MySQL 8 server. It is suitable for initial testing and controlled production use. For horizontal scaling, move MySQL to Amazon RDS, store uploaded files in S3, and place an Application Load Balancer in front of multiple application instances.

The examples use these placeholders:

- `dkprelearn.in` — React frontend
- `api.dkprelearn.in` — Laravel API
- `/var/www/ai-lms` — application directory
- `YOUR_PUBLIC_IP` — the administrator's trusted public IP/CIDR

Replace every placeholder before running the commands.

### 1. Create the EC2 instance

1. Launch an Ubuntu Server 24.04 LTS instance in the required AWS Region.
2. For an initial combined application/database server, use at least 2 vCPU, 4 GiB RAM and 30 GiB encrypted gp3 EBS storage. Size from measured load before production launch.
3. Create or select an SSH key pair.
4. Assign an Elastic IP if DNS must remain stable after an instance stop/start.
5. Configure the EC2 security group:

| Protocol | Port | Source | Purpose |
|---|---:|---|---|
| SSH | 22 | `YOUR_PUBLIC_IP/32` | Administration only |
| HTTP | 80 | `0.0.0.0/0`, `::/0` | Initial access and certificate validation |
| HTTPS | 443 | `0.0.0.0/0`, `::/0` | Application traffic |

Do **not** expose MySQL port 3306 to the internet. If the database is later moved to RDS, permit 3306 only from the application security group.

Create DNS `A` records for `dkprelearn.in` and `api.dkprelearn.in` pointing to the Elastic IP. Add a `www.dkprelearn.in` record only if the `www` address will also be supported.

### 2. Connect and install system packages

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_DNS

sudo apt update
sudo apt upgrade -y
sudo apt install -y apache2 mysql-server git unzip curl composer \
  php8.3 php8.3-cli libapache2-mod-php8.3 php8.3-mysql php8.3-curl \
  php8.3-mbstring php8.3-xml php8.3-zip php8.3-bcmath php8.3-intl

sudo a2enmod rewrite headers ssl
sudo systemctl enable --now apache2 mysql
php -v
composer --version
mysql --version
```

The frontend build requires Node.js `20.19+` or `22.12+`. Install a currently supported Node.js LTS release using the official Node.js installation instructions, then verify:

```bash
node --version
npm --version
```

### 3. Create the MySQL database

Choose a long, unique database password. Do not reuse the sample value below.

```bash
sudo mysql
```

Run the following SQL:

```sql
CREATE DATABASE ai_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ai_lms'@'localhost' IDENTIFIED BY 'REPLACE_WITH_A_LONG_RANDOM_PASSWORD';
GRANT ALL PRIVILEGES ON ai_lms.* TO 'ai_lms'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Optionally apply the MySQL security hardening wizard:

```bash
sudo mysql_secure_installation
```

### 4. Download the application

```bash
cd /var/www
sudo git clone https://github.com/dkkhare/AI-LMS.git ai-lms
sudo chown -R ubuntu:www-data /var/www/ai-lms
cd /var/www/ai-lms
```

To test an unmerged development branch, run `git checkout BRANCH_NAME` before installing dependencies. Production deployments should normally use a reviewed tag or commit from `main`.

### 5. Configure and install the Laravel backend

```bash
cd /var/www/ai-lms/backend
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
cp .env.example .env
php artisan key:generate
openssl rand -hex 32
```

Edit `/var/www/ai-lms/backend/.env` and set at least:

```dotenv
APP_NAME=AI-LMS
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.dkprelearn.in

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_lms
DB_USERNAME=ai_lms
DB_PASSWORD=REPLACE_WITH_A_LONG_RANDOM_PASSWORD

CACHE_STORE=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file

AI_LMS_IDENTITY_HMAC_KEY=PASTE_THE_OPENSSL_VALUE_HERE
AI_LMS_SUPER_ADMIN_PUBLIC_IDS=
AI_LMS_OTP_DRIVER=log
AI_LMS_OTP_TTL_MINUTES=5
AI_LMS_OTP_MAX_ATTEMPTS=5
```

`AI_LMS_IDENTITY_HMAC_KEY` must remain stable: changing it will break deterministic email/mobile lookup. Store production secrets in AWS Systems Manager Parameter Store or Secrets Manager rather than in source control.

Run the migrations and create the two installation super administrators:

```bash
php artisan migrate --force

php artisan ai-lms:bootstrap-super-admins \
  --admin1-name="First Super Admin" \
  --admin1-email="admin1@dkprelearn.in" \
  --admin1-phone="+919876543210" \
  --admin2-name="Second Super Admin" \
  --admin2-email="admin2@dkprelearn.in" \
  --admin2-phone="+919876543211" \
  --region="ap-south-1"
```

The command prints both public IDs and one-time passwords only once. Store the passwords securely, then add both public IDs to `.env` as a comma-separated value:

```dotenv
AI_LMS_SUPER_ADMIN_PUBLIC_IDS=01EXAMPLEPUBLICID1,01EXAMPLEPUBLICID2
```

Finish Laravel production preparation and permissions:

```bash
php artisan config:cache
php artisan route:cache

sudo chown -R ubuntu:www-data /var/www/ai-lms/backend
sudo find /var/www/ai-lms/backend -type d -exec chmod 755 {} \;
sudo find /var/www/ai-lms/backend -type f -exec chmod 644 {} \;
sudo chown ubuntu:www-data /var/www/ai-lms/backend/.env
sudo chmod 640 /var/www/ai-lms/backend/.env
sudo chown -R www-data:www-data /var/www/ai-lms/backend/storage /var/www/ai-lms/backend/bootstrap/cache
sudo chmod -R ug+rwX /var/www/ai-lms/backend/storage /var/www/ai-lms/backend/bootstrap/cache
```

For initial testing, OTPs are written to `backend/storage/logs/laravel.log`. Configure real email and SMS providers before allowing public registration.

### 6. Build the React frontend

```bash
cd /var/www/ai-lms/web
npm ci
cp .env.example .env.production
```

Set the production API URL in `.env.production`:

```dotenv
VITE_API_URL=https://api.dkprelearn.in/api/v1
```

Run tests and create the static production build:

```bash
npm test
npm run build
```

Only `web/dist` is served by Apache. Node.js does not need to run after the build finishes.

### 7. Configure Apache

Create `/etc/apache2/sites-available/ai-lms-api.conf`:

```apache
<VirtualHost *:80>
    ServerName api.dkprelearn.in
    DocumentRoot /var/www/ai-lms/backend/public

    <Directory /var/www/ai-lms/backend/public>
        Options FollowSymLinks
        AllowOverride None
        Require all granted

        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^ index.php [L]
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/ai-lms-api-error.log
    CustomLog ${APACHE_LOG_DIR}/ai-lms-api-access.log combined
</VirtualHost>
```

Create `/etc/apache2/sites-available/ai-lms-web.conf`:

```apache
<VirtualHost *:80>
    ServerName dkprelearn.in
    DocumentRoot /var/www/ai-lms/web/dist

    <Directory /var/www/ai-lms/web/dist>
        Options FollowSymLinks
        AllowOverride None
        Require all granted

        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ /index.html [L]
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/ai-lms-web-error.log
    CustomLog ${APACHE_LOG_DIR}/ai-lms-web-access.log combined
</VirtualHost>
```

Enable the sites and validate Apache configuration:

```bash
sudo a2dissite 000-default.conf
sudo a2ensite ai-lms-api.conf ai-lms-web.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

### 8. Enable HTTPS

First confirm that both domains load over HTTP and their DNS records resolve to this instance. Then install Certbot using its current official Apache/Ubuntu instructions and request certificates for both sites. A common packaged installation is:

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d dkprelearn.in -d api.dkprelearn.in
sudo certbot renew --dry-run
```

After HTTPS is enabled, verify that Certbot configured HTTP-to-HTTPS redirection.

### 9. Add the Laravel scheduler

```bash
sudo crontab -u www-data -e
```

Add:

```cron
* * * * * cd /var/www/ai-lms/backend && php artisan schedule:run >> /dev/null 2>&1
```

When background jobs are added, change `QUEUE_CONNECTION` to the approved MySQL queue configuration, commit the required queue migrations, and run workers under systemd or Supervisor. Do not run `php artisan queue:work` manually as a permanent production service.

### 10. Verify the deployment

```bash
curl -I https://dkprelearn.in
curl https://api.dkprelearn.in/up
cd /var/www/ai-lms/backend && php artisan about
sudo systemctl status apache2 mysql --no-pager
sudo tail -n 100 /var/log/apache2/ai-lms-api-error.log
```

Open these pages in a browser:

- `https://dkprelearn.in/signin`
- `https://dkprelearn.in/signup`
- `https://dkprelearn.in/tenant-register`
- `https://api.dkprelearn.in/up`

Change both one-time super-administrator passwords immediately. The current development milestone logs OTPs locally and does not yet include production email/SMS delivery or completed MFA enforcement; do not treat it as production-ready until those controls are implemented and tested.

## Updating an existing installation

Back up the database before every deployment, then deploy a reviewed tag or commit:

```bash
cd /var/www/ai-lms
git pull --ff-only

cd backend
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache

cd ../web
npm ci
npm test
npm run build

sudo systemctl reload apache2
```

## Development commands

Backend:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan test
php artisan serve
```

Frontend:

```bash
cd web
npm install
cp .env.example .env
npm test
npm run dev
```

## Official deployment references

- [Amazon EC2 getting started](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html)
- [Amazon EC2 security groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html)
- [Amazon EC2 Elastic IP addresses](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html)
- [Ubuntu Apache installation](https://ubuntu.com/server/docs/how-to/web-services/install-apache2/)
- [Ubuntu Apache virtual-host configuration](https://ubuntu.com/server/docs/how-to/web-services/configure-apache2-settings/)
- [Ubuntu PHP with Apache and MySQL](https://ubuntu.com/server/docs/how-to/web-services/install-php/)
- [Ubuntu MySQL installation](https://ubuntu.com/server/docs/how-to/databases/install-mysql/)
- [Laravel 12 deployment](https://laravel.com/docs/12.x/deployment)
- [Certbot instructions](https://certbot.eff.org/instructions)

## Current status

The project is under active development. Review the open draft pull request and architecture documents before treating any module as complete.
