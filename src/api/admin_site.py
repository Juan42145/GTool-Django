from collections import defaultdict
from types import SimpleNamespace
from django.contrib import admin
from .admin_class import *

# Variable to determine ordering midpoint
order_default = 10

# Custom functions
def register_app(label, order):
    # Register app/module order
    admin.site.ordering[label]['order'] = order if order>0 else order_default-order

def register(cls, module, order=0, admin_class=BaseAdmin):
    # Register model with module attribute and order
    setattr(cls, 'module', module)
    admin.site.ordering[module]['model'][cls._meta.verbose_name_plural] = order
    admin.site.register(cls, admin_class)

#Imports to replicate _build_app_dict
from django.utils.text import capfirst
from django.urls import NoReverseMatch, reverse
from django.apps import apps

# Custom admin
class MyAdminSite(admin.AdminSite):
    site_header = 'Administration'
    site_title = ' '
    ordering = defaultdict(lambda: {'order': order_default, 'model': defaultdict(lambda: float('inf'))})

    #CUSTOM FUNCTIONS
    def get_app(self, model, app_label):
        # Create/Get app data
        is_custom = hasattr(model, 'module')
        label = model.module if is_custom else app_label
        return SimpleNamespace(
            label = label,
            name = label.title() if is_custom else apps.get_app_config(app_label).verbose_name,
            query = f'?sub={label}' if is_custom else '',
            order = getattr(model,'','def')
        )

    def create_app_dict(self, param, app):
        # Create app dictionary injecting custom values
        app_label, has_module_perms, model_dict = param
        return {
            "name": app.name,
            "app_label": app.label,
            "app_url": reverse(
                "admin:app_list",
                kwargs={"app_label": app_label},
                current_app=self.name,
            ) + app.query,
            "has_module_perms": has_module_perms,
            "models": [model_dict],
        }

    # OVERWRITE FUNCTIONS
    def _build_app_dict(self, request, label=None):
        # Overwrite to allow app_dict insertion
        """
        Build the app dictionary. The optional `label` parameter filters models
        of a specific app.
        """
        app_dict = {}

        if label:
            models = {
                m: m_a
                for m, m_a in self._registry.items()
                if m._meta.app_label == label
            }
        else:
            models = self._registry


        for model, model_admin in models.items():
            app_label = model._meta.app_label

            has_module_perms = model_admin.has_module_permission(request)
            if not has_module_perms:
                continue

            perms = model_admin.get_model_perms(request)

            # Check whether user has any perm for this module.
            # If so, add the module to the model_list.
            if True not in perms.values():
                continue

            info = (app_label, model._meta.model_name)
            model_dict = {
                "model": model,
                "name": capfirst(model._meta.verbose_name_plural),
                "object_name": model._meta.object_name,
                "perms": perms,
                "admin_url": None,
                "add_url": None,
            }
            if perms.get("change") or perms.get("view"):
                model_dict["view_only"] = not perms.get("change")
                try:
                    model_dict["admin_url"] = reverse(
                        "admin:%s_%s_changelist" % info, current_app=self.name
                    )
                except NoReverseMatch:
                    pass
            if perms.get("add"):
                try:
                    model_dict["add_url"] = reverse(
                        "admin:%s_%s_add" % info, current_app=self.name
                    )
                except NoReverseMatch:
                    pass

            # CUSTOM Add app labels for admin dashboard (Source: https://github.com/django/django/blob/main/django/contrib/admin/sites.py)
            app = self.get_app(model, app_label)
            if app.label in app_dict:
                app_dict[app.label]["models"].append(model_dict)
            else:
                param = (app_label, has_module_perms, model_dict)
                app_dict[app.label] = self.create_app_dict(param, app)

        return app_dict

    def get_app_list(self, request, app_label=None):
        # Overwrite to allow custom sorting
        """
        Return a sorted list of all the installed apps that have been
        registered in this site.
        """
        app_dict = self._build_app_dict(request, app_label)

        # Sort the apps alphabetically. CUSTOM: Added ordering
        app_list = sorted(app_dict.values(), key=lambda x:
                          (self.ordering[x["name"].lower()]['order'], x["name"].lower()))

        # Sort the models alphabetically within each app.
        for app in app_list:
            order_dict = self.ordering[app['app_label']]['model']
            app["models"].sort(key=lambda x:(order_dict[x["name"].lower()], x["name"].lower()))

        return app_list

    # VIEW FUNCTIONS
    def app_index(self, request, app_label, extra_context = None):
        # Include query string in view context
        response = super().app_index(request, app_label, extra_context)
        extra_context = extra_context or {}

        is_custom = 'sub' in request.GET
        extra_context['sub_app'] = request.GET['sub'] if is_custom else app_label
        title = request.GET['sub'].title() if is_custom else response.context_data['title']
        extra_context['title'] = title + ' Administration'if is_custom else title.replace('administration','Administration')
        return super().app_index(request, app_label, extra_context)

admin.site = MyAdminSite()
