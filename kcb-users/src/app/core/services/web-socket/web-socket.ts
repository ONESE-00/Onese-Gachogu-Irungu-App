import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {catchError, switchMap, share, takeUntil, retryWhen} from 'rxjs/operators';
import { Observable, Subject, timer, EMPTY, tap} from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class WebSocket implements OnDestroy {
  // private socket$!: WebSocketSubject<any>;
  // private destroy$ = new Subject<void>()
  // private message$!: Observable<any>;

  // connect(url: string): void {
  //   //Return if the Socket is already open
  //   if(this.socket$ && !this.socket$.closed) return 

  //   this.socket$ = webSocket<any>({
  //     url,

  //     deserializer: ({ data }) => {
  //       try {
  //         return JSON.parse(data);
  //       } catch {
  //         return data;
  //       }
  //     },

  //     openObserver: {
  //       next: () => console.log('WebSocket connection opened')
  //     },

  //     closeObserver: {
  //       next: (event) => console.log('WebSocket connection closed. Code =>',event.code)
  //     }
  //   });

  //   //Messages
  //   this.message$ = this.socket$.pipe(
  //     tap({error: err => console.error('Websocket Error',err)}),

  //     catchError(err => {
  //       console.error('Websocket FATAL Error', err);
  //       return EMPTY; // Return an empty observable to complete the stream
  //     }),

  //     takeUntil(this.destroy$),
  //     share()
  //   )
  // }

  // send(message: any): void{
  //   if(this.socket$ && !this.socket$.closed){
  //     this.socket$.next(message);
  //   }else {
  //     console.error('WebSocket connection is not open. Unable to send message.');
  //   }
  // }

  // getMessages():Observable<any> {
  //   return this.message$;
  // }

  // disconnect(): void{
  //   if(this.socket$){
  //     this.socket$.complete();
  //   }
  // }

  // ngOnDestroy(): void {
  //   this.destroy$.next()
  //   this.destroy$.complete()
  //   this.disconnect()
  // }

  private socket$!: WebSocketSubject<any>
  private destroy$ = new Subject<void>()
  private messages$!: Observable<any>

  connect(url: string): void {
    //Return if Socket is already open
    if(this.socket$ && !this.socket$.closed) return

    this.socket$ = webSocket<any> ({url, 

      deserializer: ({data}) => {
        try {
          return JSON.parse(data)
        }catch
        {
          return data
        }
      },

      openObserver: {
        next: () => console.log('WebSocket connection Opened')
      },

      closeObserver: {
        next: (event) => console.log('WebSocket connection closed. Code =>', event.code)
      }
    })

    this.messages$ = this.socket$.pipe(
      tap({error: err => console.error('WebSocket Error', err)}),

      catchError( err => {
        console.error('WebSocket FATAL Error', err);
        return EMPTY
      }),
      takeUntil(this.destroy$),
      share()
    )
  }

  getMessages(): Observable<any>{
    return this.messages$
  }
  
  send(message: any): void {
    if(this.socket$ && !this.socket$.closed){
      this.socket$.next(message)
    }else {
      console.error('WebSocket connection is not open. Unable to send message.')
    }
  }

  disconnect(): void {
    if(this.socket$){
      this.socket$.complete()
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.disconnect()
  }
}
