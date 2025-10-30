import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultaService } from '../../../services/consulta/consulta.service';
import { Consulta } from '../../../models/consulta/consulta.model';

@Component({
  selector: 'app-consulta-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-update.component.html',
})
export class ConsultaUpdateComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private srv: ConsultaService,
    private router: Router
  ) {}

  ngOnInit(): void {}
}
