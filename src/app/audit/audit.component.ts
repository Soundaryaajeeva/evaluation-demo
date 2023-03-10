import { Component, OnInit } from '@angular/core';
import { first, take } from 'rxjs/operators';

import { Audit, User } from '@/_models';
import { AuditService, AuthenticationService } from '@/_services';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
@Component({ templateUrl: 'audit.component.html' })
export class AuditComponent implements OnInit {
    audits = [];
    sortedData = [];
    pagedData = [];
    filteredData = [];
    currentUser: User;
    currentPage = 1;
    pageSize = 5;
    maxPage: number;
    sortKey: string = '';
    sortDirection = 'asc';
    searchForm: FormGroup;
    options = ['12 hours', '24 hours'];
    auditData = [];
    constructor(
        private authenticationService: AuthenticationService,
        private auditService: AuditService, private formBuilder: FormBuilder, public datePipe: DatePipe
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    }

    ngOnInit() {
        this.loadAllAudits();
        this.searchForm = this.formBuilder.group({
            searchTerm: [''],
            selectedTime: ['12 hours']
        });
    }

    private loadAllAudits() {
        this.auditService.getAll()
            .pipe(take(1))
            .subscribe((audits: any) => {
                this.audits = audits.map((data) => {
                    const login = Number(data.loginTime);
                    const logout = Number(data.logoutTime);
                    data.loginTime = data.loginTime ? this.datePipe.transform(new Date(login), 'dd/MM/yyyy hh:mm:ss a') : data.loginTime;
                    data.logoutTime = data.logoutTime ? this.datePipe.transform(new Date(logout), 'dd/MM/yyyy hh:mm:ss a') : data.logoutTime;
                    return data;
                });
                this.auditData = this.audits;
                this.maxPage = Math.ceil(this.audits.length / this.pageSize);
                this.filterData();
                this.sortData();
            });
    }

    sortData() {
        if (this.sortKey) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            const direction = this.sortDirection === 'asc' ? 1 : -1;
            this.sortedData = this.audits.sort((a, b) => {
                return a[this.sortKey] > b[this.sortKey] ? direction : -direction;
            });
            this.pagedData = this.getPagedData();
        }
    }

    filterData() {
        const auditData = this.auditData;
        this.audits = auditData.filter((audit: any) => {
            const idMatch = audit._id.toString().includes(this.searchForm.controls['searchTerm'].value);
            const userMatch = audit.user.toString().includes(this.searchForm.controls['searchTerm'].value);
            const loginMatch = audit.loginTime.toString().includes(this.searchForm.controls['searchTerm'].value);
            const logoutMatch = audit.logoutTime.toString().includes(this.searchForm.controls['searchTerm'].value);
            const ipMatch = audit.ip.toString().includes(this.searchForm.controls['searchTerm'].value);
            return idMatch || userMatch || loginMatch || logoutMatch || ipMatch;
        });
        this.currentPage = 1;
    }

    getPagedData() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.audits.slice(startIndex, endIndex);
    }
    goToPreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.pagedData = this.getPagedData();
        }
    }
    goToNextPage() {
        const maxPage = Math.ceil(this.audits.length / this.pageSize);
        this.maxPage = maxPage;
        if (this.currentPage < maxPage) {
            this.currentPage++;
            this.pagedData = this.getPagedData();

        }
    }
    getPageNumbers() {
        const maxPage = Math.ceil(this.audits.length / this.pageSize);
        this.maxPage = maxPage;
        return Array.from({ length: maxPage }, (_, index) => index + 1);
    }
    onOptionSelected() {
        if (this.searchForm.controls['selectedTime'].value === '12 hours') {
            this.audits = this.auditData.map((data) => {
                data.loginTime = data.loginTime ? this.datePipe.transform(new Date(data.loginTime), 'dd/MM/yyyy hh:mm:ss a') : data.loginTime;
                data.logoutTime = data.logoutTime ?this.datePipe.transform(new Date(data.logoutTime), 'dd/MM/yyyy hh;mm:ss a') : data.logoutTime;
                return data;
            });
        } else {
            this.audits = this.auditData.map((data) => {
                console.log(data.logoutTime)
                data.loginTime =data.loginTime?  this.datePipe.transform(new Date(data.loginTime), 'dd/MM/yyyy HH:mm'): data.loginTime;
                data.logoutTime = data.logoutTime? this.datePipe.transform(new Date(data.logoutTime), 'dd/MM/yyyy HH:mm'): data.logoutTime;
                return data;
            });
        }
    }

}
