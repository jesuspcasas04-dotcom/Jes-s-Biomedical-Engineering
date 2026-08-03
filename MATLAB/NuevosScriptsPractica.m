%
%Señal exponencial compleja.
%t: variable independiente (tiempo).
%x: variable dependiente.
%El tiempo aumentará un segundo con muestras de 1/500 en 1/500.
%

t=0:1/500:1;

fun=exp((-2+1j*2*pi*50)*t);

figure(1);

subplot(211); plot(t,abs(fun),'g.'); xlabel('Tiempo');ylabel('Módulo');title('Módulo de función compleja con respecto al tiempo');

subplot(212); plot(t,angle(fun),'r.'); xlabel('Tiempo');ylabel('fase'); title('Fase de función compleja con respecto al tiempo');

figure(2): polar(angle(fun), abs(fun)); title('Diagram Polar. ');