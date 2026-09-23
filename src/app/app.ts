import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackendConnectionService } from './services/backend-connection.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly backendConnection = inject(BackendConnectionService);

  ngOnInit(): void {
    this.backendConnection.checkConnection();
  }
}
