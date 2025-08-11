import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TasksRoutingModule } from './tasks-routing.module';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskCreateComponent } from './task-create/task-create.component';

@NgModule({
  imports: [
    CommonModule,
    TasksRoutingModule,
    TaskListComponent,
    TaskCreateComponent
  ]
})
export class TasksModule { }