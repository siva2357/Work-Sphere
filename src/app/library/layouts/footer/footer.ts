import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '../../UI/components/button/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, Button],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  currentYear = new Date().getFullYear();
}

