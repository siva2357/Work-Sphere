import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserNavbar } from '../../library/layouts/user-navbar/user-navbar';
import { Sidebar } from '../../library/layouts/sidebar/sidebar';


@Component({
    selector: 'app-client',
    standalone: true,
    imports: [RouterOutlet, Sidebar, UserNavbar],
    templateUrl: './hr.html',
    styleUrl: './hr.css'
})
export class Hr {

}
