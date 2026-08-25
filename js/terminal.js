/* ==========================================================================
   TERMINAL SHELL ENGINE
   Interactive bash/sh command parser, tab completion, history & easter eggs.
   ========================================================================== */

class CyberTerminal {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.historyContainer = document.getElementById('command-history');
        this.terminalOutput = document.getElementById('terminal-output');

        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentUser = 'toor';
        this.savedVisitorName = 'toor';
        this.awaitingVisitorName = false;
        this.awaitingRootPassword = false;
        this.rootPassword = '0xDEAD_R00T!';

        // Fail2Ban tracking
        this.failedAttempts = 0;
        this.maxAttempts = 3;
        this.isBanned = false;

        // Command definitions & aliases
        this.commands = {
            'help': () => this.cmdHelp(),
            'ls': () => this.cmdLs(),
            'whoami': () => this.cmdWhoami(),
            'skills': () => this.cmdSkills(),
            'projects': () => this.cmdProjects(),
            'education': () => this.cmdEducation(),
            'certs': () => this.cmdCertifications(),
            'certifications': () => this.cmdCertifications(),
            'contact': () => this.cmdContact(),
            'forensics': () => this.cmdForensics(),
            'aws': () => this.cmdAWS(),
            'devsecops': () => this.cmdDevSecOps(),
            'matrix': () => this.cmdMatrix(),
            'theme': () => this.cmdTheme(),
            'gui': () => this.cmdGui(),
            'clear': () => this.cmdClear(),
            'cls': () => this.cmdClear(),
            'exit': () => this.cmdExit(),
            'logout': () => this.cmdExit(),
            'su': () => this.cmdSu(),
            'su root': () => this.cmdSu(),
            'sudo': () => this.cmdSudo(),
            'sudo su': () => this.cmdSudo(),
            'fail2ban': () => this.cmdFail2ban(),
            'fail2ban-client': () => this.cmdFail2ban(),
            'unban': () => this.cmdUnban(),
            'nmap': () => this.cmdNmap(),
            'top': () => this.cmdTop(),
            'cat flag.txt': () => this.cmdFlag(),
            'flag': () => this.cmdFlag()
        };

        this.init();
    }

    init() {
        if (!this.input) return;

        // Set prompt user to toor@therahulpatil:~$
        this.setPromptUser(this.currentUser);

        // Start boot login sequence
        this.startBootSequence();

        // Focus input on click anywhere in terminal
        this.terminalOutput.addEventListener('click', () => this.input.focus());

        // Keyboard Listener
        this.input.addEventListener('keydown', (e) => {
            if (window.cyberAudio) window.cyberAudio.playKeyClick();

            if (e.key === 'Enter') {
                const commandText = this.input.value.trim();
                this.executeCommand(commandText);
                this.input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down');
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.handleTabCompletion();
            }
        });

        // Dock buttons
        document.querySelectorAll('.dock-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.getAttribute('data-cmd');
                this.executeCommand(cmd);
                if (window.cyberAudio) window.cyberAudio.playSuccessChime();
            });
        });
    }

    setPromptUser(username) {
        const promptLabel = document.getElementById('prompt-label');
        if (!promptLabel) return;

        if (this.awaitingRootPassword) {
            promptLabel.innerHTML = '<span class="cmd-highlight">Password: </span>';
        } else {
            const isRoot = username === 'root';
            const symbol = isRoot ? '#' : '$';
            promptLabel.innerHTML = `<span class="prompt-user">${this.escapeHTML(username)}@therahulpatil</span>:<span class="prompt-path">~</span>${symbol} `;
        }
    }

    startBootSequence() {
        const bootStream = document.getElementById('boot-log-stream');
        if (!bootStream) return;

        bootStream.innerHTML = '';

        const bootLogs = [
            { text: "<span class='cmd-highlight'>[BOOT SYSTEM] Connecting to SSH Server therahulpatil.in:22...</span>", delay: 150 },
            { text: "therahulpatil login: <span class='highlight'>root</span>", delay: 450 },
            { text: "Password: ••••••••••••••••", delay: 800 },
            { text: "<span class='highlight'>[OK] Access Granted! Authenticated as root@therahulpatil</span>", delay: 1150 },
            { text: "<span class='error-msg'>[SECURITY POLICY] Demoting root privileges for guest visitor mode...</span>", delay: 1500 },
            { text: "<span class='highlight'>[SYSTEM READY] - Welcome to therahulpatil's Cyber Security Terminal.</span>", delay: 1850 },
            { text: "Type <span class='cmd-highlight'>'help'</span> or <span class='cmd-highlight'>'ls'</span> to list available security commands & system profiles.", delay: 2150 },
            { text: "<span class='highlight'>Logged in as toor@therahulpatil:~$</span>", delay: 2450 }
        ];

        bootLogs.forEach(log => {
            setTimeout(() => {
                const line = document.createElement('div');
                line.className = 'boot-log-line';
                line.style.margin = '4px 0';
                line.innerHTML = log.text;
                bootStream.appendChild(line);
                if (window.cyberAudio) window.cyberAudio.playKeyClick();
                this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
            }, log.delay);
        });
    }

    executeCommand(rawCmd) {
        if (rawCmd === '' && !this.awaitingRootPassword) return;

        // Fail2Ban Lockout check
        if (this.isBanned && rawCmd.toLowerCase().trim() !== 'unban' && rawCmd.toLowerCase().trim() !== 'fail2ban-client unban') {
            this.historyContainer.innerHTML = `
                <div class="terminal-cmd-entry">
                    <div class="cmd-response">
                        <span class="error-msg">[FAIL2BAN ACCESS BLOCKED] IP 127.0.0.1 (user '${this.escapeHTML(this.currentUser)}') is JAILED!</span>
                        <br>Type <span class="cmd-highlight">'unban'</span> to release the Fail2Ban iptables DROP rule.
                    </div>
                </div>
            `;
            if (window.cyberAudio) window.cyberAudio.playErrorBeep();
            return;
        }

        // Check if terminal is awaiting root password input
        if (this.awaitingRootPassword) {
            const isValidPass = (rawCmd === this.rootPassword || rawCmd === 'FLAG{0xDEAD_R00T!}');
            
            if (isValidPass) {
                this.awaitingRootPassword = false;
                this.failedAttempts = 0;
                this.input.type = 'text';
                this.currentUser = 'root';
                this.setPromptUser('root');
                this.historyContainer.innerHTML = `
                    <div class="terminal-cmd-entry">
                        <div class="cmd-response">
                            <span class="cmd-highlight">[ROOT UNLOCKED] Authentication successful! Switched session to root@therahulpatil.</span>
                        </div>
                    </div>
                `;
                if (window.cyberAudio) window.cyberAudio.playSuccessChime();
            } else {
                this.failedAttempts++;
                const attemptsLeft = this.maxAttempts - this.failedAttempts;

                if (attemptsLeft > 0) {
                    // Prompt for next retry attempt
                    this.awaitingRootPassword = true;
                    this.input.type = 'password';
                    this.setPromptUser('password');
                    this.historyContainer.innerHTML = `
                        <div class="terminal-cmd-entry">
                            <div class="cmd-response">
                                <span class="error-msg">su: Authentication failure (${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining)</span>
                            </div>
                        </div>
                    `;
                    if (window.cyberAudio) window.cyberAudio.playErrorBeep();
                } else {
                    // Trigger Fail2Ban Jail!
                    this.awaitingRootPassword = false;
                    this.isBanned = true;
                    this.input.type = 'text';
                    this.setPromptUser(this.currentUser);
                    this.historyContainer.innerHTML = `
                        <div class="terminal-cmd-entry">
                            <div class="cmd-response">
                                <span class="error-msg">[FAIL2BAN TRIGGERED] 3 Failed authentication attempts for user '${this.escapeHTML(this.currentUser)}'.</span>
                                <br><span class="accent-red">IP: 127.0.0.1 [JAIL: sshd-jail] -> STATUS: BANNED!</span>
                                <br>
                                <pre class="glow-text" style="margin-top:8px;">
================================================================================
[FAIL2BAN JAIL AUDIT LOG - /var/log/fail2ban.log]
Status for jail: sshd-jail
|- Filter: sshd (Failed logons threshold reached: 3/3)
|- Actions: iptables -I INPUT -s 127.0.0.1 -j DROP
\`- Currently Banned: 1 IP (127.0.0.1)

* Type 'unban' to release IP 127.0.0.1 from the Fail2Ban jail!
================================================================================
</pre>
                            </div>
                        </div>
                    `;
                    if (window.cyberAudio) window.cyberAudio.playErrorBeep();
                }
            }
            return;
        }

        // Check for 'name <username>' or 'user <username>' or 'login <username>'
        const lowerRaw = rawCmd.toLowerCase().trim();
        if (lowerRaw.startsWith('name ') || lowerRaw.startsWith('user ') || lowerRaw.startsWith('login ')) {
            const newName = lowerRaw.split(' ')[1]?.trim().replace(/[^a-z0-9_]/g, '');
            if (newName) {
                this.currentUser = newName;
                this.savedVisitorName = newName;
                this.setPromptUser(this.currentUser);
                this.historyContainer.innerHTML = `
                    <div class="terminal-cmd-entry">
                        <div class="cmd-response">
                            <span class="highlight">Username updated to ${this.escapeHTML(this.currentUser)}@therahulpatil</span>
                        </div>
                    </div>
                `;
                if (window.cyberAudio) window.cyberAudio.playSuccessChime();
                return;
            }
        }

        // Clear initial boot log stream & previous output to keep screen clean
        const bootStream = document.getElementById('boot-log-stream');
        if (bootStream) bootStream.innerHTML = '';
        this.historyContainer.innerHTML = '';

        // Push to history
        this.commandHistory.push(rawCmd);
        this.historyIndex = this.commandHistory.length;

        // Create command line entry in history DOM
        const entry = document.createElement('div');
        entry.className = 'terminal-cmd-entry';
        entry.innerHTML = `
            <div class="cmd-line">
                <span class="prompt-user">${this.escapeHTML(this.currentUser)}@therahulpatil</span>:<span class="prompt-path">~</span>${this.currentUser === 'root' ? '#' : '$'} <span class="cmd-executed">${this.escapeHTML(rawCmd)}</span>
            </div>
            <div class="cmd-response"></div>
        `;
        this.historyContainer.appendChild(entry);

        const responseBox = entry.querySelector('.cmd-response');
        const lowerCmd = rawCmd.toLowerCase();

        if (this.commands[lowerCmd]) {
            const output = this.commands[lowerCmd]();
            if (output) responseBox.innerHTML = output;
            if (window.cyberAudio) window.cyberAudio.playSuccessChime();
        } else {
            responseBox.innerHTML = `<span class="error-msg">bash: command not found: ${this.escapeHTML(rawCmd)}. Type <span class="cmd-highlight">'help'</span> for command list.</span>`;
            if (window.cyberAudio) window.cyberAudio.playErrorBeep();
        }

        // Auto scroll to bottom
        this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;

        if (direction === 'up') {
            if (this.historyIndex > 0) this.historyIndex--;
        } else if (direction === 'down') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
            } else {
                this.historyIndex = this.commandHistory.length;
                this.input.value = '';
                return;
            }
        }
        this.input.value = this.commandHistory[this.historyIndex] || '';
    }

    handleTabCompletion() {
        const val = this.input.value.trim().toLowerCase();
        if (!val) return;

        const matches = Object.keys(this.commands).filter(c => c.startsWith(val));
        if (matches.length === 1) {
            this.input.value = matches[0];
        } else if (matches.length > 1) {
            this.executeCommand(val);
        }
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    /* COMMAND HANDLERS */
    cmdHelp() {
        return `
AVAILABLE SYSTEM COMMANDS:
--------------------------------------------------------------------------------
 <span class="cmd-highlight">whoami</span>        : Display Agent Bio, Core Expertise & Credentials
 <span class="cmd-highlight">skills</span>        : Print Complete Technical Skills Matrix (Sec, AWS, DevOps)
 <span class="cmd-highlight">projects</span>      : List DevSecOps, AWS VPC Architecture & Cloud Projects
 <span class="cmd-highlight">education</span>     : View Academic Qualifications & Percentage Marks
 <span class="cmd-highlight">certs</span>         : View AWS Cloud Practitioner Certificate & Verification
 <span class="cmd-highlight">contact</span>       : Print Contact Info, Phone, Email, Social Links
 <span class="cmd-highlight">forensics</span>     : Display Digital Forensics & Investigation Toolsets
 <span class="cmd-highlight">devsecops</span>     : Inspect Automated CI/CD & Security Compliance Pipeline
 <span class="cmd-highlight">su / sudo</span>     : Request Root Privilege Escalation (3 Password Attempts)
 <span class="cmd-highlight">fail2ban</span>      : View Fail2Ban Jail Audit & Security Status
 <span class="cmd-highlight">unban</span>         : Unban IP 127.0.0.1 & Reset Failed Authentication Jail
 <span class="cmd-highlight">exit / logout</span> : Exit root session or restart terminal login
 <span class="cmd-highlight">matrix</span>        : Toggle Matrix Digital Rain Background On/Off
 <span class="cmd-highlight">theme</span>         : Cycle Theme Palette (Matrix Green / Cyber Cyan / Amber / Red)
 <span class="cmd-highlight">gui</span>           : Switch to Interactive Cyberpunk Dashboard GUI Mode
 <span class="cmd-highlight">clear</span>         : Clear Terminal Output Buffer
 <span class="cmd-highlight">nmap</span>, <span class="cmd-highlight">top</span>, <span class="cmd-highlight">flag</span>: Security Easter Eggs & CTF Flag
--------------------------------------------------------------------------------`;
    }

    cmdLs() {
        return `
drwxr-xr-x 2 root root  4096 Aug 2026 <span class="cmd-highlight">cybersecurity/</span>
drwxr-xr-x 2 root root  4096 Aug 2026 <span class="cmd-highlight">aws_cloud_architecture/</span>
drwxr-xr-x 2 root root  4096 Aug 2026 <span class="cmd-highlight">devsecops_pipelines/</span>
drwxr-xr-x 2 root root  4096 Aug 2026 <span class="cmd-highlight">digital_forensics/</span>
-rw-r--r-- 1 root root  2048 Aug 2026 <span class="highlight">resume.txt</span>
-rw-r--r-- 1 root root   512 Aug 2026 <span class="accent-red">flag.txt</span>
`;
    }

    cmdWhoami() {
        return `
NAME        : <span class="highlight">RAHUL PRAFULLA PATIL</span>
ROLE        : DevSecOps Engineer | AWS Cloud Specialist | System & Network Administrator
CERTIFICATE : <span class="cmd-highlight">AWS Certified Cloud Practitioner</span>
EXPERTISE   : Network Admin, SysAdmin, AWS Cloud, DevSecOps, Network Defence, Compliance & Forensics`;
    }

    cmdSkills() {
        return `
TECHNICAL SKILLS MATRIX:
================================================================================
<span class="cmd-highlight">[+] AWS & CLOUD INFRASTRUCTURE:</span>
    EC2, S3, VPC, IAM, ECR, RDS, EBS, EFS, Route 53, Security Groups, NACLs

<span class="cmd-highlight">[+] NETWORKING & PROTOCOLS:</span>
    OSI Model, TCP/IP, Subnetting, Routing (RIP, OSPF, EIGRP), VLANs, NACLs, Wireshark

<span class="cmd-highlight">[+] DEVSECOPS & IaC:</span>
    Jenkins, Docker, Docker Swarm, Kubernetes, Terraform, Ansible, Maven, Git, GitHub

<span class="cmd-highlight">[+] CYBERSECURITY & DEFENCE:</span>
    OWASP Top 10, Web & Android Security, Vulnerability Assessment,
    Firewalls, Snort, Suricata, iptables, Fail2Ban, Proxy, OpenVPN

<span class="cmd-highlight">[+] MONITORING & TELEMETRY:</span>
    Prometheus, Grafana, Elasticsearch, Logstash, Kibana (ELK), cAdvisor

<span class="cmd-highlight">[+] DIGITAL FORENSICS:</span>
    OSForensics, Autopsy, FTK Imager, Magnet AXIOM, Volatility, TestDisk, Memory/Net Forensics

<span class="cmd-highlight">[+] OS & DATABASES:</span>
    Ubuntu, Debian, Rocky Linux, Windows Server, MySQL, Oracle

<span class="cmd-highlight">[+] PROGRAMMING & SCRIPTING:</span>
    Python, C, Bash / Shell Scripting
================================================================================`;
    }

    cmdProjects() {
        return `
FEATURED ENGINEERING PROJECTS:
================================================================================
<span class="cmd-highlight">1. SecureDevOps: Automated CI/CD & Security Compliance Pipeline for Cloud Apps</span>
   * Developed end-to-end DevSecOps platform automating AWS infrastructure provisioning using Terraform.
   * Built automated CI/CD pipelines in Jenkins with integrated SAST/DAST (SonarQube & OWASP ZAP).
   * Container vulnerability scanning using Trivy & Docker deployment.
   * Realtime telemetry & alert monitoring with Prometheus & Grafana.

<span class="cmd-highlight">2. Secure AWS VPC Architecture for Web Application Deployment</span>
   * Architected multi-tier VPC with public and private subnets.
   * Configured Bastion Host in public subnet for secure SSH access to private instances.
   * Implemented NAT Gateway for controlled outbound traffic & enforced strict NACLs/Security Groups.

<span class="cmd-highlight">3. Static Web Hosting Using AWS</span>
   * Configured S3 static website hosting, permissions, bucket policies, and CloudFront CDN integration.
   * Achieved sub-second loading performance and high availability.
================================================================================`;
    }

    cmdEducation() {
        return `
ACADEMIC QUALIFICATIONS (ls -l /var/log/education/):
-rw-r--r-- 1 PGCP-ITISS   <span class="cmd-highlight">75.14%</span> Aug 2026 <span class="highlight">Sunbeam_Institute_of_Info_Tech.edu</span>
-rw-r--r-- 1 B.Tech-CSE   <span class="cmd-highlight">72.58%</span> Jun 2024 <span class="highlight">Tatyasaheb_Kore_Inst_of_Engg_&_Tech.edu</span>
-rw-r--r-- 1 HSC-Class12  <span class="cmd-highlight">75.08%</span> Feb 2020 <span class="highlight">Yashwantrao_Chavan_Warana_Mahavidhyalaya.edu</span>
-rw-r--r-- 1 SSC-Class10  <span class="cmd-highlight">85.60%</span> Mar 2018 <span class="highlight">Shree_Warana_Vidhyalaya.edu</span>`;
    }

    cmdCertifications() {
        return `
OFFICIAL CERTIFICATIONS:
--------------------------------------------------------------------------------
Certification : <span class="highlight">AWS Certified Cloud Practitioner</span>
Verification  : <a href="https://cp.certmetrics.com/amazon/en/public/verify/credential/c49b3418666a41818f74795c50633cff" target="_blank" style="color:var(--accent-cyan);">https://cp.certmetrics.com/amazon/en/public/verify/credential/...</a>
--------------------------------------------------------------------------------`;
    }

    cmdContact() {
        return `
CONTACT DIRECTORY:
--------------------------------------------------------------------------------
Phone    : <span class="highlight">+91 9604622595</span>
Email    : <a href="mailto:patilrahulprafulla@gmail.com" style="color:var(--main-color)">patilrahulprafulla@gmail.com</a>
GitHub   : <a href="https://github.com/therahulpatil" target="_blank" style="color:var(--accent-cyan)">https://github.com/therahulpatil</a>
LinkedIn : <a href="https://www.linkedin.com/in/patilrahulprafulla" target="_blank" style="color:var(--accent-cyan)">https://github.com/therahulpatil</a>
Domain   : <a href="https://therahulpatil.in" target="_blank" style="color:var(--highlight)">https://therahulpatil.in</a>
--------------------------------------------------------------------------------`;
    }

    cmdForensics() {
        return `
[DIGITAL FORENSICS TOOLKIT]
--------------------------------------------------------------------------------
Memory Forensics   : Volatility 3, LiME, WinPmem
Disk & Artifacts   : Autopsy, FTK Imager, OSForensics, Magnet AXIOM, TestDisk
Network Forensics  : Wireshark, Tshark, NetworkMiner, tcpdump
File System        : NTFS, ext4, FAT32 hex analysis & file carving
--------------------------------------------------------------------------------`;
    }

    cmdAWS() {
        return `
[AWS INFRASTRUCTURE SUITE]
--------------------------------------------------------------------------------
Compute & Containers : EC2, ECR, ECS, Docker Swarm
Storage & DB        : S3, EBS, EFS, RDS (MySQL / Oracle)
Networking & Security: VPC, Subnets, Internet Gateway, NAT Gateway, Route 53, IAM
IaC Automation      : Terraform, Ansible
--------------------------------------------------------------------------------`;
    }

    cmdDevSecOps() {
        return `
[DEVSECOPS PIPELINE STACK]
--------------------------------------------------------------------------------
Code & SCM      : Git, GitHub
CI/CD Engine    : Jenkins Automation Server
SAST / DAST     : SonarQube, OWASP ZAP
Container Sec   : Docker, Trivy Vulnerability Scanner
IaC & Orchestr. : Terraform, Kubernetes, Docker Swarm
Monitoring      : Prometheus, Grafana, ELK Stack (Elasticsearch, Logstash, Kibana)
--------------------------------------------------------------------------------`;
    }

    cmdSu() {
        if (this.currentUser === 'root') {
            return `Already logged in as root@therahulpatil.in`;
        }
        if (this.isBanned) {
            return `<span class="error-msg">[FAIL2BAN ACCESS BLOCKED] IP 127.0.0.1 is jailed! Type 'unban' to release.</span>`;
        }
        this.awaitingRootPassword = true;
        this.setPromptUser(this.currentUser);
        this.input.type = 'password';
        return `[sudo] password for ${this.escapeHTML(this.currentUser)}: `;
    }

    cmdSudo() {
        return this.cmdSu();
    }

    cmdFail2ban() {
        return `
Status for Fail2Ban Service:
================================================================================
Number of Jail(s): 1
Jail list        : sshd-jail
Jail status      : <span class="${this.isBanned ? 'error-msg' : 'highlight'}">${this.isBanned ? 'ACTIVE (1 BANNED IP)' : 'IDLE (0 BANNED IPs)'}</span>
Failed Attempts  : ${this.failedAttempts} / ${this.maxAttempts}
Banned IP        : ${this.isBanned ? '127.0.0.1 (localhost)' : 'None'}
================================================================================`;
    }

    cmdUnban() {
        this.isBanned = false;
        this.failedAttempts = 0;
        this.awaitingRootPassword = false;
        this.input.type = 'text';
        this.setPromptUser(this.currentUser);
        return `<span class="cmd-highlight">[FAIL2BAN UNBAN] IP 127.0.0.1 released from sshd-jail. Failed authentication counter reset to 0.</span>`;
    }

    cmdExit() {
        if (this.currentUser === 'root') {
            this.currentUser = this.savedVisitorName || 'toor';
            this.setPromptUser(this.currentUser);
            return `<span class="cmd-highlight">logout</span><br>Dropped root privileges. Returned to session: <span class="highlight">${this.escapeHTML(this.currentUser)}@therahulpatil</span>`;
        }

        // Restart terminal session
        this.currentUser = 'toor';
        this.failedAttempts = 0;
        this.isBanned = false;
        this.awaitingRootPassword = false;
        this.input.type = 'text';
        this.setPromptUser('toor');
        this.startBootSequence();
        return `<span class="error-msg">[SESSION TERMINATED] Connection to therahulpatil.in closed. Restarting terminal login...</span>`;
    }

    cmdMatrix() {
        if (window.matrixEffect) {
            const running = window.matrixEffect.togglePause();
            return `Matrix Digital Rain Effect: <span class="highlight">${running ? 'ENABLED' : 'DISABLED'}</span>`;
        }
        return `Matrix engine not loaded.`;
    }

    cmdTheme() {
        if (window.cyberApp) {
            const nextTheme = window.cyberApp.cycleTheme();
            return `Theme changed to: <span class="cmd-highlight">${nextTheme.toUpperCase()}</span>`;
        }
        return `Theme switcher unavailable.`;
    }

    cmdGui() {
        if (window.cyberApp) {
            window.cyberApp.switchView('gui');
            return `Switching interface mode to CYBERPUNK GUI...`;
        }
        return `GUI mode unavailable.`;
    }

    cmdClear() {
        this.historyContainer.innerHTML = '';
        return null;
    }

    cmdNmap() {
        return `
Starting Nmap 7.94 ( https://nmap.org ) at 2026-08-25 16:15 IST
Nmap scan report for therahulpatil.in (127.0.0.1)
Host is up (0.00015s latency).
Not shown: 997 closed tcp ports
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https

Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds.`;
    }

    cmdTop() {
        return `
top - 16:15:08 IST up 42 days,  3:14,  1 user,  load average: 0.08, 0.03, 0.01
Tasks: 142 total,   1 running, 141 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.1 us,  0.5 sy,  0.0 ni, 97.4 id,  0.0 wa,  0.0 hi,  0.0 si
MiB Mem :   7892.4 total,   3412.1 free,   2104.5 used,   2375.8 buff/cache

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1337 root      20   0  512400  48200  12400 S   1.5   0.6   4:12.05 devsecops-agent
 2048 root      20   0  324100  32100   8900 S   0.8   0.4   2:45.10 prometheus
 4096 root      20   0  128000  18200   4500 S   0.3   0.2   0:55.22 grafana
`;
    }

    cmdFlag() {
        return `<span class="cmd-highlight">FLAG{0xDEAD_R00T!}</span>`;
    }
}

// Instantiate on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    window.cyberTerminal = new CyberTerminal();
});
