# Configurazione msmtp per notifiche deploy

## Installazione

```bash
sudo apt update
sudo apt install msmtp msmtp-mta mailutils
```

## Configurazione SMTP

Creare `/home/digital_automations/.msmtprc`:

```
defaults
auth           on
tls            on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile        /home/digital_automations/.msmtp.log

account        default
host           smtp.gmail.com
port           587
from           noreply@digitalautomations.it
user           ACCOUNT_EMAIL
password       APP_PASSWORD
```

Proteggere il file:
```bash
chmod 600 ~/.msmtprc
```

**Nota**: per Gmail usare una [App Password](https://myaccount.google.com/apppasswords), non la password dell'account.

## Configurazione mailutils

Creare `/home/digital_automations/.mailrc`:
```
set sendmail="/usr/bin/msmtp"
set message-sendmail-extra-arguments="-a default"
```

## Test

```bash
echo "Test da $(hostname)" | mail -s "Test msmtp" marco.nucci@digitalautomations.it
```

## Alternativa: Mailgun

Se si preferisce Mailgun, sostituire host/port/user/password con:
```
host           smtp.mailgun.org
port           587
from           noreply@mg.digitalautomations.it
user           postmaster@mg.digitalautomations.it
password       MAILGUN_SMTP_PASSWORD
```
