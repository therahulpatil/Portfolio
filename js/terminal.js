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
            'sudo': () => this.cmdSudo(),
            'nmap': () => this.cmdNmap(),
            'top': () => this.cmdTop(),
            'cat flag.txt': () => this.cmdFlag(),
            'flag': () => this.cmdFlag()
        };

        this.init();
    }

    init() {
        if (!this.input) return;

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

    executeCommand(rawCmd) {
        if (rawCmd === '') return;

        // Clear previous command output to keep screen clean and easy to read
        this.historyContainer.innerHTML = '';

        // Push to history
        this.commandHistory.push(rawCmd);
        this.historyIndex = this.commandHistory.length;

        // Create command line entry in history DOM
        const entry = document.createElement('div');
        entry.className = 'terminal-cmd-entry';
        entry.innerHTML = `
            <div class="cmd-line">
                <span class="prompt-user">visitor@therahulpatil</span>:<span class="prompt-path">~</span>$ <span class="cmd-executed">${this.escapeHTML(rawCmd)}</span>
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
 <span class="cmd-highlight">matrix</span>        : Toggle Matrix Digital Rain Background On/Off
 <span class="cmd-highlight">theme</span>         : Cycle Theme Palette (Matrix Green / Cyber Cyan / Amber / Red)
 <span class="cmd-highlight">gui</span>           : Switch to Interactive Cyberpunk Dashboard GUI Mode
 <span class="cmd-highlight">clear</span>         : Clear Terminal Output Buffer
 <span class="cmd-highlight">nmap</span>, <span class="cmd-highlight">top</span>, <span class="cmd-highlight">flag</span>: Security Easter Eggs & Network Tools
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
[IDENTITY CHECK]
--------------------------------------------------------------------------------
NAME      : <span class="highlight">RAHUL PRAFULLA PATIL</span>
ROLE      : DevSecOps Engineer | AWS Cloud Specialist | System & Network Administrator
CERTIFIED : <span class="cmd-highlight">AWS Certified Cloud Practitioner</span>
EXPERTISE : Network Admin, SysAdmin, AWS Cloud, DevSecOps, Network Defence, Forensics
DOMAIN    : <span class="highlight">therahulpatil.in</span>
LOCATION  : Maharashtra, India
--------------------------------------------------------------------------------`;
    }

    cmdSkills() {
        return `
TECHNICAL SKILLS MATRIX:
================================================================================
<span class="cmd-highlight">[+] CYBERSECURITY & DEFENCE:</span>
    OWASP Top 10, Web & Android Security, Vulnerability Assessment,
    Firewalls, Snort, Suricata, iptables, Fail2Ban, Proxy, OpenVPN

<span class="cmd-highlight">[+] AWS & CLOUD INFRASTRUCTURE:</span>
    EC2, S3, VPC, IAM, ECR, RDS, EBS, EFS, Route 53, Security Groups, NACLs

<span class="cmd-highlight">[+] DEVSECOPS & IaC:</span>
    Jenkins, Docker, Docker Swarm, Kubernetes, Terraform, Ansible, Maven, Git, GitHub

<span class="cmd-highlight">[+] MONITORING & TELEMETRY:</span>
    Prometheus, Grafana, Elasticsearch, Logstash, Kibana (ELK), cAdvisor

<span class="cmd-highlight">[+] NETWORKING & PROTOCOLS:</span>
    OSI Model, TCP/IP, Subnetting, Routing (RIP, OSPF, EIGRP), VLANs, NACLs, Wireshark

<span class="cmd-highlight">[+] DIGITAL FORENSICS:</span>
    OSForensics, Autopsy, FTK Imager, Magnet AXIOM, Volatility, TestDisk, Memory/Net Forensics

<span class="cmd-highlight">[+] PROGRAMMING & SCRIPTING:</span>
    Python, C, Bash / Shell Scripting

<span class="cmd-highlight">[+] OS & DATABASES:</span>
    Ubuntu, Debian, Rocky Linux, Windows Server, MySQL, Oracle
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
ACADEMIC QUALIFICATIONS:
--------------------------------------------------------------------------------
[2026] <span class="highlight">PGCP - ITISS</span> | Sunbeam Institute of Info Tech          - <span class="cmd-highlight">75.14%</span>
[2024] <span class="highlight">B.Tech - CSE</span> | Tatyasaheb Kore Institute of Engg & Tech - <span class="cmd-highlight">72.58%</span>
[2020] <span class="highlight">HSC (Class XII)</span> | Yashwantrao Chavan Warana Mahavidhyalaya - <span class="cmd-highlight">75.08%</span>
[2018] <span class="highlight">SSC (Class X)</span> | Shree Warana Vidhyalaya                  - <span class="cmd-highlight">85.60%</span>
--------------------------------------------------------------------------------`;
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
LinkedIn : <a href="https://www.linkedin.com/in/patilrahulprafulla" target="_blank" style="color:var(--accent-cyan)">https://www.linkedin.com/in/patilrahulprafulla</a>
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

    cmdSudo() {
        return `<span class="error-msg">[ACCESS DENIED] root privilege escalation blocked. User visitor is logged in audit trail!</span>`;
    }

    cmdNmap() {
        return `
Starting Nmap 7.94 ( https://nmap.org ) at 2026-08-25 12:35 UTC
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
top - 12:35:05 up 42 days,  3:14,  1 user,  load average: 0.08, 0.03, 0.01
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
        return `<span class="cmd-highlight">FLAG{r4hul_p4t1l_d3vs3c0ps_m4st3r_2026}</span>`;
    }
}

// Instantiate on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    window.cyberTerminal = new CyberTerminal();
});
