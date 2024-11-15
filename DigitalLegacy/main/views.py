from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.contrib import messages


def index(request):
    return render(request, "main/main.html", {"title": "ЄСпадщина"})


def contact(request):
    if request.method == "POST":
        name = request.POST.get("name")
        email = request.POST.get("email")
        message = request.POST.get("message")

        send_mail(
            f"Сообщение от {name}",
            message,
            email,
            ["info@espadshchina.ua"],
            fail_silently=False,
        )

        messages.success(request, "Ваше повідомлення було відправлено успішно!")
        return redirect("index")
    return render(request, "main/contact.html")
