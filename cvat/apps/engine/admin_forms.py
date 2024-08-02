from django import forms

from cvat.apps.organizations.models import Organization

class BulkUserCreationForm(forms.Form):
    count = forms.IntegerField(initial=1, help_text="생성할 유저 수.")
    start = forms.IntegerField(initial=1, help_text="생성할 유저의 시작 인덱스.")
    prefix = forms.CharField(initial="test", max_length=255, help_text="생성할 유저네임의 접두사.")
    password = forms.CharField(initial="defaultpassword", max_length=255, help_text="생성할 유저의 비밀번호.")
    group = forms.CharField(initial="user", max_length=255, help_text="생성할 유저의 그룹. 기본값 user.")


class BulkMembershipCreationForm(forms.Form):
    prefix = forms.CharField(initial="test", max_length=255, help_text="생성할 유저네임의 접두사.")
    role = forms.ChoiceField(initial="worker", choices=[("worker", "worker"), ("supervisor", "supervisor"), ("maintainer", "maintainer"), ("owner", "owner")], help_text="생성할 멤버쉽의 권한.")
    organization = forms.ModelChoiceField(queryset=Organization.objects.all(), help_text="멤버쉽을 생성할 조직.")